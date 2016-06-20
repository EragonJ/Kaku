var Electron = require('electron');
var Remote = Electron.remote;
var IpcRenderer = Electron.ipcRenderer;
var Dialog = Remote.dialog;
var EventEmitter = require('events').EventEmitter;
var Notifier = require('./Notifier');
var videojs = require('video.js');

var PreferenceManager = require('../../modules/PreferenceManager');
var TrackInfoFetcher = require('kaku-core/modules/TrackInfoFetcher');
var DownloadManager = require('../../modules/DownloadManager');
var HistoryManager = require('../../modules/HistoryManager');
var L10nManager = require('../../modules/L10nManager');
var KakuCore = require('../../modules/KakuCore');
var Searcher = require('../../modules/Searcher');
var Tracker = require('../../modules/Tracker');
var Defer = require('../../modules/Defer');
var _ = L10nManager.get.bind(L10nManager);

videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

// This should be a wrapper of Videojs and expose
// needed events / API out for callee to use
function Player() {
  EventEmitter.call(this);

  this._playingTrack = null;
  this._playingTrackTime = 0;
  this._playerRepeatMode = 'no';
  this._playerDOM = null;
  this._player = null;

  this._role = 'default';

  // TODO
  // If users click on track, we have to update this index ?
  this._pendingTrackIndex = 0;
  this._pendingTracks = [];

  this._pendingDefers = [];
  this._bindShortcuts();
}

Player.prototype = Object.create(EventEmitter.prototype);
Player.constructor = Player;

// Because we share on() for customized & vjs's event,
// we need to bind to the right place when using it.
Player.CUSTOMIZED_EVENTS = [
  'repeatModeUpdated'
];

Object.defineProperty(Player.prototype, 'repeatMode', {
  enumerable: true,
  configurable: true,
  get: function() {
    return this._playerRepeatMode;
  },
  set: function(mode) {
    if (this.isRoleGuest()) {
      return;
    }

    if (mode === 'no' || mode === 'one' || mode === 'all') {
      this._playerRepeatMode = mode;
      this.emit('repeatModeUpdated', mode);
    }
  }
});

Object.defineProperty(Player.prototype, 'playingTrack', {
  enumerable: true,
  configurable: false,
  get: function() {
    return this._playingTrack;
  }
});

Object.defineProperty(Player.prototype, 'playingTrackTime', {
  enumerable: true,
  configurable: false,
  get: function() {
    return this._playingTrackTime;
  }
});

Player.prototype._bindShortcuts = function() {
  IpcRenderer.on('key-MediaNextTrack', () => {
    this.playNextTrack();
  });

  IpcRenderer.on('key-MediaPreviousTrack', () => {
    this.playPreviousTrack();
  });

  IpcRenderer.on('key-MediaPlayPause', () => {
    this.playOrPause();
  });

  IpcRenderer.on('key-Escape', () => {
    if (this._player.isFullscreen()) {
      this._player.exitFullscreen();
    }
  });
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
  this._player.on('play', () => {
    this._updateAppHeader('play');
  });

  this._player.on('timeupdate', () => {
    let time = this._player.currentTime();
    this._playingTrackTime = time || 0;
  });

  this._player.on('ended', () => {
    this._updateAppHeader('ended');
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
  var elem = this._player.el();
  if (show) {
    elem.classList.add('vjs-waiting');
  }
  else {
    elem.classList.remove('vjs-waiting');
  }
};

Player.prototype._executePendingDefers = function() {
  this._pendingDefers.forEach((defer) => {
    defer.resolve(this._player);
  });
  this._pendingDefers = [];
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
    var self = this;
    var promise = new Promise((resolve) => {
      videojs(
        this._playerDOM,
        this._getDefaultVideoJSConfig()
      ).ready(function() {
        self._player = this;
        self._addPlayerEvents();
        self._executePendingDefers();

        // return real videojs-ed player out
        resolve(self._player);
      });
    });
    return promise;
  }
};

Player.prototype.playAll = function(tracks) {
  if (this.isRoleGuest()) {
    return;
  }

  // let's override tracks at first
  this._pendingTracks = tracks;
  this._pendingTrackIndex = -1;

  // then play the first one !
  this.playNextTrack();
};

Player.prototype.playPreviousTrack = function() {
  if (this.isRoleGuest()) {
    return;
  }

  if (this._pendingTrackIndex <= 0) {
    this._pendingTrackIndex = 0;
  }
  else {
    this._pendingTrackIndex -= 1;
  }
  this.play(this._pendingTracks[this._pendingTrackIndex]);
};

Player.prototype.playNextTrack = function() {
  if (this.isRoleGuest()) {
    return;
  }

  // By default, when hit end in this mode, we will stop the player.
  if (this._playerRepeatMode === 'no') {
    if (this._pendingTrackIndex > this._pendingTracks.length - 1) {
      this._pendingTracks = [];
      this.stop();
    }
    else {
      this._pendingTrackIndex += 1;
      this.play(this._pendingTracks[this._pendingTrackIndex]);
    }
  }
  // Users want to keep listening the same track, so let's keep playing.
  else if (this._playerRepeatMode === 'one') {
    // No need to update the index
    this.play(this._pendingTracks[this._pendingTrackIndex]);
  }
  // Loop all tracks
  else if (this._playerRepeatMode === 'all') {
    this._pendingTrackIndex += 1;
    if (this._pendingTrackIndex > this._pendingTracks.length - 1) {
      this._pendingTrackIndex = 0;
    }

    this.play(this._pendingTracks[this._pendingTrackIndex]);
  }
};

Player.prototype.playPreviousTrack = function() {
  if (this._pendingTrackIndex <= 0) {
    // if we keep pressing play previous button,
    // we will keep playing the first one
    this._pendingTrackIndex = 0;
  }
  else {
    this._pendingTrackIndex -= 1;
  }
  this.play(this._pendingTracks[this._pendingTrackIndex]);
};

Player.prototype.on = function() {
  var args = arguments;
  var eventName = args[0];

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
  var args = arguments;
  var eventName = args[0];

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
  if (rawTrack.platformTrackUrl) {
    return Promise.resolve(rawTrack);
  }
  else {
    var promise = new Promise((resolve) => {
      var keyword = rawTrack.artist + ' - ' + rawTrack.title;
      Searcher.search(keyword, 1).then(function(tracks) {
        var trackInfo;
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
  if (track.platformTrackRealUrl) {
    return Promise.resolve(track);
  }
  else {
    var trackUrl = track.platformTrackUrl;
    return TrackInfoFetcher.getInfo(trackUrl).then((fetchedInfo) => {
      track.platformTrackRealUrl= fetchedInfo.url;
      track.ext = fetchedInfo.ext;
      return Promise.resolve(track);
    });
  }
};

Player.prototype._updateAppHeader = function(state) {
  if (state === 'play' && this._playingTrack && this._playingTrack.title) {
    var maxLength = 40;
    var translatedTitle = _('app_title_playing', {
      name: this._playingTrack.title
    });
    if (translatedTitle.length > maxLength) {
      translatedTitle = translatedTitle.substr(0, maxLength) + ' ...';
    }
    KakuCore.title = translatedTitle;
  }
  else if (state === 'ended') {
    KakuCore.title = _('app_title_normal');
  }
};

Player.prototype.setVolume = function(operation) {
  // Videojs will check volume's max / min by itself,
  // so we don't have to do extra check
  this.ready().then(() => {
    var currentVolume = this._player.volume();
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

Player.prototype.stop = function(fromDJ) {
  if (this.isRoleGuest() && !fromDJ) {
    return;
  }

  this.ready().then(() => {
    this._player.pause();
    this._player.currentTime(0);
  });
};

Player.prototype.playOrPause = function(fromDJ) {
  if (this.isRoleGuest() && !fromDJ) {
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

Player.prototype.pause = function(fromDJ) {
  if (this.isRoleGuest() && !fromDJ) {
    return;
  }

  this.ready().then(() => {
    this._player.pause();
  });
};

Player.prototype.play = function(rawTrack, time, fromDJ) {
  // This may be coming from Online DJ
  let currentTime = time || 0;

  // If the role is guest and the "play" request is not coming from DJ,
  // then it means the user is trying to control the player by himself and
  // this should be forbidden.
  if (this.isRoleGuest() && !fromDJ) {
    return;
  }

  this.ready().then(() => {
    // If we already have playingTrack in internal variable,
    // when this.play() is called, we will directly play the same track
    // instead of fetching from remote again.
    if (!rawTrack) {
      if (this._player.paused() && this._playingTrack) {
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

            this._playingTrack = realTrack;
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

Player.prototype.downloadCurrentTrack = function() {
  this.ready().then((player) => {
    var src = player.src();
    if (!src) {
      return;
    }

    // All needed info will be stored here
    var playingTrack = this.playingTrack;
    var filename = playingTrack.title + '.' + playingTrack.ext;

    Dialog.showSaveDialog({
      title: 'Where to download your track ?',
      defaultPath: filename
    }, (path) => {
      if (path) {
        Notifier.alert('Start to download your track !');
        var req = DownloadManager.download(src, path);
        req.on('error', () => {
          Notifier.alert('Sorry, something went wrong, please try again');
        }).on('close', () => {
          Notifier.alert('Download finished ! Go check your track :)');
        });
      }
    });
  });
};

Player.prototype.changeRole = function(role) {
  if (role === 'guest') {
    this._role = 'guest';
  }
  else if (role === 'dj') {
    this._role = 'dj';
  }
  else {
    this._role = 'default';
  }
};

Player.prototype.isRoleDJ = function() {
  return this.getRole() === 'dj';
};

Player.prototype.isRoleGuest = function() {
  return this.getRole() === 'guest';
};

Player.prototype.isRoleDefault = function() {
  return this.getRole() === 'default';
};

Player.prototype.getRole = function() {
  return this._role;
};

module.exports = new Player();
