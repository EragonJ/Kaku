import Electron from 'electron';
import Notifier from './Notifier';
import { EventEmitter } from 'events';
import videojs from 'video.js';
videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

const Remote = Electron.remote;
const Dialog = Remote.dialog;

import PreferenceManager from '../../modules/PreferenceManager';
import TrackInfoFetcher from 'kaku-core/modules/TrackInfoFetcher';
import HistoryManager from '../../modules/HistoryManager';
import L10nManager from '../../modules/L10nManager';
import AppCore from '../../modules/AppCore';
import Searcher from '../../modules/Searcher';
import Tracker from '../../modules/Tracker';
import Defer from 'kaku-core/modules/Defer';

const _ = L10nManager.get.bind(L10nManager);

// This should be a wrapper of Videojs and expose
// needed events / API out for callee to use
function Player() {
  EventEmitter.call(this);

  this.playingTrack = null;
  this.playingTrackTime = 0;

  this.trackIndex = -1;
  this.randomIndex = -1;
  this.randomIndexes = [];
  this.tracks = [];
  this.disabled = false;

  this.modes = ['no', 'one', 'all', 'random'];
  this.mode = this.modes[0];

  this._playerDOM = null;
  this._player = null;
  this._pendingReadyDefers = [];
}

Player.prototype = Object.create(EventEmitter.prototype);
Player.constructor = Player;
Player.cache = {};

// Because we share on() for customized & vjs's event,
// we need to bind to the right place when using it.
Player.CUSTOMIZED_EVENTS = [
  'modeUpdated',
  'tracksUpdated'
];

Player.prototype.changeMode = function(mode) {
  // like Player.changeMode('no')
  if (typeof mode === 'string') {
    let index = this.modes.indexOf(mode);
    if (index >= 0) {
      this.mode = mode;
      this.emit('modeUpdated', this.mode);
    }
  }
  // like Player.changeMode() - jump to next one
  else {
    let maxLength = this.modes.length;

    let index = this.modes.indexOf(this.mode);
    index = (index + 1) % maxLength;
    let newIndex = Math.max(0, Math.min(index, maxLength - 1));

    this.mode = this.modes[newIndex];
    this.emit('modeUpdated', this.mode);
  }
};

Player.prototype._getDefaultVideoJSConfig = function() {
  return {
    width: '100%',
    height: 'auto',
    autoplay: false,
    bigPlayButton: false,
    controls: true,
    controlBar: {
      playToggle: false,
      fullscreenToggle: true,
      muteToggle: false
    }
  };
};

Player.prototype._addPlayerEvents = function() {
  this._player.on('timeupdate', () => {
    let time = this._player.currentTime();
    this.playingTrackTime = time || 0;
  });

  this._player.on('ended', () => {
    this.playNextTrack();
  });

  this._player.on('volumechange', () => {
    PreferenceManager.setPreference('default.volume', this._player.volume());
  });

  this._player.on('error', (error) => {
    Notifier.alert('Unknown errors, please try again');

    // Some hints
    console.log('Please report following errors to us, thanks !');
    console.log(error);
  });
};

Player.prototype._toggleSpinner = function(show) {
  // Because _player.loadingSpinner.show() doesn't work in this case,
  // we have to forcely toggle vjs-waiting class to make the loading
  // spinner work.
  let elem = this._player.el();
  if (show) {
    elem.classList.add('vjs-waiting');
  }
  else {
    elem.classList.remove('vjs-waiting');
  }
};

Player.prototype.exitFullscreen = function() {
  this.ready().then(() => {
    if (this._player.isFullscreen()) {
      this._player.exitFullscreen();
    }
  });
};

Player.prototype.setPlayer = function(playerDOM) {
  this._playerDOM = playerDOM;
};

Player.prototype.ready = function() {
  if (!this._playerDOM) {
    let defer = Defer();
    this._pendingReadyDefers.push(defer);
    return defer.promise;
  }
  else if (this._player) {
    return Promise.resolve(this._player);
  }
  else {
    let self = this;
    let promise = new Promise((resolve) => {
      videojs(
        this._playerDOM,
        this._getDefaultVideoJSConfig()
      ).ready(function() {
        self._player = this;
        self._addPlayerEvents();
        self._executePendingReadyDefers();

        // return real videojs-ed player out
        resolve(self._player);
      });
    });
    return promise;
  }
};

Player.prototype.addTracks = function(tracks) {
  if (this.disabled) {
    return;
  }

  this.tracks = tracks;
  this.trackIndex = -1;
  this.randomIndex = -1;
  this.randomIndexes = this.makeRandomIndexes(this.tracks.length);

  this.emit('tracksUpdated', this.tracks);
};

Player.prototype.playNextTrack = function(forceIndex) {
  if (this.disabled) {
    return;
  }

  if (forceIndex) {
    this.trackIndex = Math.max(0, Math.min(forceIndex, this.tracks.length -1));
    this.play(this.tracks[this.trackIndex]);
    return;
  }

  if (this.mode === 'no') {
    this.trackIndex += 1;

    if (this.trackIndex >= this.tracks.length) {
      this.stop();
    }
    else {
      this.trackIndex = Math.min(this.trackIndex, this.tracks.length - 1);
      this.play(this.tracks[this.trackIndex]);
    }
  }
  else if (this.mode === 'random') {
    this.randomIndex += 1;

    if (this.randomIndex >= this.tracks.length) {
      this.stop();
    }
    else {
      this.randomIndex = Math.min(this.randomIndex, this.tracks.length - 1);
      this.trackIndex = this.randomIndexes[this.randomIndex];
      this.play(this.tracks[this.trackIndex]);
    }
  }
  else if (this.mode === 'one') {
    this.trackIndex = Math.max(0, this.trackIndex);
    this.play(this.tracks[this.trackIndex]);
  }
  else if (this.mode === 'all') {
    this.trackIndex = (this.trackIndex + 1) % this.tracks.length;
    this.play(this.tracks[this.trackIndex]);
  }
};

Player.prototype.playPreviousTrack = function() {
  if (this.disabled) {
    return;
  }

  if (this.mode === 'no' || this.mode === 'random') {
    this.trackIndex -= 1;

    if (this.trackIndex < 0) {
      this.stop();
    }
    else {
      this.trackIndex = Math.max(this.trackIndex, 0);
      this.play(this.tracks[this.trackIndex]);
    }
  }
  else if (this.mode === 'random') {
    this.randomIndex -= 1;

    if (this.randomIndex < 0) {
      this.stop();
    }
    else {
      this.randomIndex = Math.max(this.randomIndex, 0);
      this.trackIndex = this.randomIndexes[this.randomIndex];
      this.play(this.tracks[this.trackIndex]);
    }
  }
  else if (this.mode === 'one') {
    this.trackIndex = Math.max(this.trackIndex, 0);
    this.play(this.tracks[this.trackIndex]);
  }
  else if (this.mode === 'all') {
    this.trackIndex = Math.max(0, this.trackIndex - 1);
    this.play(this.tracks[this.trackIndex]);
  }
};

Player.prototype.on = function() {
  let args = arguments;
  let eventName = args[0];

  if (Player.CUSTOMIZED_EVENTS.indexOf(eventName) !== -1) {
    this.constructor.prototype.on.apply(this, args);
  }
  else {
    this.ready().then(() => {
      this._player.on.apply(this._player, args);
    });
  }
};

Player.prototype.off = function() {
  let args = arguments;
  let eventName = args[0];

  if (Player.CUSTOMIZED_EVENTS.indexOf(eventName) !== -1) {
    this.constructor.prototype.removeEventListener.apply(this, args);
  }
  else {
    this.ready().then(() => {
      this._player.off.apply(this._player, args);
    });
  }
};

Player.prototype._prepareTrackData = function(rawTrack) {
  let id = rawTrack.platformId;

  if (Player.cache[id]) {
    return Promise.resolve(Player.cache[id]);
  }
  else {
    let promise = new Promise((resolve) => {
      let keyword = rawTrack.artist + ' - ' + rawTrack.title;
      Searcher.search(keyword, 1).then(function(tracks) {
        let trackInfo;
        // NOTE
        // We may not find any track when searching.
        if (tracks.length > 0) {
          trackInfo = tracks[0];
          // NOTE
          // we have to keep its original title, artist and covers
          // in order not to confuse users
          trackInfo.artist = rawTrack.artist;
          trackInfo.title = rawTrack.title;
          trackInfo.covers = rawTrack.covers;
        }
        resolve(trackInfo);
      });
    });
    return promise;
  }
};

Player.prototype._getRealTrack = function(track) {
  let id = track.platformId;

  if (Player.cache[id]) {
    return Promise.resolve(Player.cache[id]);
  }
  else {
    let trackUrl = track.platformTrackUrl;
    return TrackInfoFetcher.getInfo(trackUrl).then((fetchedInfo) => {
      track.platformTrackRealUrl= fetchedInfo.url;
      track.ext = fetchedInfo.ext;
      Player.cache[id] = track;
      return Promise.resolve(track);
    });
  }
};

Player.prototype._executePendingReadyDefers = function() {
  this._pendingReadyDefers.forEach((defer) => {
    defer.resolve(this._player);
  });
};

Player.prototype.setVolume = function(operation) {
  // Videojs will check volume's max / min by itself,
  // so we don't have to do extra check
  this.ready().then(() => {
    let currentVolume = this._player.volume();
    switch (operation) {
      case 'default':
        this._player.volume(0.5);
        break;

      case 'mute':
        this._player.volume(0);
        break;

      case 'up':
        this._player.volume(currentVolume + 0.1);
        break;

      case 'down':
        this._player.volume(currentVolume - 0.1);
        break;

      default:
        let volume = parseFloat(operation, 10);
        if (!isNaN(volume)) {
          this._player.volume(volume);
        }
        break;
    }
    Tracker.event('Player', 'set volume', this._player.volume()).send();
  });
};

Player.prototype.stop = function(force) {
  if (this.disabled && !force) {
    return;
  }

  this.ready().then(() => {
    this.trackIndex = -1;
    this.randomIndex = -1;
    this._player.pause();
    this._player.currentTime(0);
  });
};

Player.prototype.playOrPause = function(force) {
  if (this.disabled && !force) {
    return;
  }

  this.ready().then(() => {
    if (this._player.paused()) {
      this.play();
    }
    else {
      this.pause();
    }
  });
};

Player.prototype.pause = function(force) {
  if (this.disabled && !force) {
    return;
  }

  this.ready().then(() => {
    this._player.pause();
  });
};

Player.prototype.play = function(rawTrack, time, force) {
  // This may be coming from Online DJ
  let currentTime = time || 0;

  // If the role is guest and the "play" request is not coming from DJ,
  // then it means the user is trying to control the player by himself and
  // this should be forbidden.
  if (this.disabled && !force) {
    return;
  }

  this.ready().then(() => {
    // If we already have playingTrack in internal variable,
    // when this.play() is called, we will directly play the same track
    // instead of fetching from remote again.
    if (!rawTrack) {
      if (this._player.paused() && this.playingTrack) {
        this._player.play();
      }
    }
    else {
      this._player.pause();
      this._toggleSpinner(true);
      this._prepareTrackData(rawTrack).then((foundTrack) => {
        // we did find a track from searcher
        if (foundTrack) {
          this._getRealTrack(foundTrack).then((realTrack) => {
            Tracker.event('Player', 'play',
              realTrack.platformTrackUrl).send();

            this.playingTrack = realTrack;
            this._player.src(realTrack.platformTrackRealUrl);
            this._player.currentTime(currentTime);
            this._player.play();
            this._toggleSpinner(false);

            // keep this track into history
            HistoryManager.add(realTrack);

            // show notification on desktop if possible
            Notifier.sendDesktopNotification({
              title: realTrack.title,
              body: realTrack.artist
            });
          });
        }
        else {
          // TODO
          // need l10n here
          Notifier.alert('Sorry, we can\'t find the track in current ' +
            'searcher, please try again with another searcher !');
          this._toggleSpinner(false);
        }
      });
    }
  });
};

Player.prototype.makeRandomIndexes = function(length) {
  // Fisher-Yates (aka Knuth) Shuffle
  let temp;
  let randomIndex;
  let currentIndex = length;

  // length = 5 -> array = [0, 1, 2, 3, 4]
  let array = Array.from({
    length: length
  }, (v, k) => k);

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }

  return array;
};

Player.prototype.disable = function(val) {
  this.disabled = !!val;
};

module.exports = new Player();
