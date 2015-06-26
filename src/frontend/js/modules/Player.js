define(function(require) {
  'use strict';

  var remote = requireNode('remote');
  var globalShortcut = remote.require('global-shortcut');
  var EventEmitter = requireNode('events').EventEmitter;

  var Notifier = require('modules/Notifier');
  var videojs = require('videojs');

  var TrackInfoFetcher = require('backend/TrackInfoFetcher');
  var HistoryManager = require('backend/HistoryManager');
  var L10nManager = require('backend/L10nManager');
  var Searcher = require('backend/Searcher');
  var Tracker = require('backend/Tracker');

  videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

  // This should be a wrapper of Videojs and expose
  // needed events / API out for callee to use
  var Player = function() {
    EventEmitter.call(this);

    this._playingTrack = null;
    this._playerDOM = null;
    this._player = null;

    // TODO
    // If users click on track, we have to update this index ?
    this._pendingTrackIndex = 0;
    this._pendingTracks = [];

    this._bindGlobalShortcuts();
  };

  Player.prototype = Object.create(EventEmitter.prototype);
  Player.constructor = Player;

  Object.defineProperty(Player.prototype, 'playingTrack', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._playingTrack;
    }
  });

  Player.prototype._bindGlobalShortcuts = function() {
    globalShortcut.register('MediaNextTrack', () => {
      this.playNextTrack();
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      this.playPreviousTrack();
    });

    globalShortcut.register('MediaPlayPause', () => {
      this.playOrPause();
    });

    globalShortcut.register('CmdOrCtrl+Up', () => {
      this.setVolume('up');
    });

    globalShortcut.register('CmdOrCtrl+Down', () => {
      this.setVolume('down');
    });

    globalShortcut.register('Escape', () => {
      this.ready().then(() => {
        this._player.exitFullscreen();
      });
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

    this._player.on('ended', () => {
      this._updateAppHeader('ended');
      this.playNextTrack();
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

  Player.prototype.setPlayer = function(playerDOM) {
    this._playerDOM = playerDOM;
  };

  Player.prototype.ready = function() {
    if (!this._playerDOM) {
      return Promise.reject('playerDOM is not ready');
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
          // return real videojs-ed player out
          resolve(self._player);
        });
      });
      return promise;
    }
  };

  Player.prototype.playAll = function(tracks) {
    // let's override tracks at first
    this._pendingTracks = tracks;
    this._pendingTrackIndex = 0;

    // then play the first one !
    this.play(this._pendingTracks[this._pendingTrackIndex]);
  };

  Player.prototype.playPreviousTrack = function() {
    if (this._pendingTrackIndex <= 0) {
      this._pendingTrackIndex = 0;
    }
    else {
      this._pendingTrackIndex -= 1;
    }
    this.play(this._pendingTracks[this._pendingTrackIndex]);
  };

  Player.prototype.playNextTrack = function() {
    if (this._pendingTrackIndex > this._pendingTracks.length - 1) {
      // we are in the end
      this._pendingTracks = [];
      this.stop();
    }
    else {
      this._pendingTrackIndex += 1;
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
    this.ready().then(() => {
      this._player.on.apply(this._player, args);
    });
  };

  Player.prototype._prepareTrackData = function(rawTrack) {
    if (rawTrack.platformTrackUrl) {
      return Promise.resolve(rawTrack);
    }
    else {
      var promise = new Promise((resolve) => {
        var keyword = rawTrack.artist + ' - ' + rawTrack.title;
        Searcher.search(keyword, 1).then(function(tracks) {
          var trackInfo = tracks[0];

          // NOTE
          // we have to keep its original title, artist and covers
          // in order not to confuse users
          trackInfo.artist = rawTrack.artist;
          trackInfo.title = rawTrack.title;
          trackInfo.covers = rawTrack.covers;
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
        var trackRealUrl = fetchedInfo.url;
        track.platformTrackRealUrl= trackRealUrl;
        return Promise.resolve(track);
      });
    }
  };

  Player.prototype._updateAppHeader = function(state) {
    if (state === 'play') {
      L10nManager.get('app_title_playing', {
        name: this._playingTrack.title
      }).then((translatedTitle) => {
        document.title = translatedTitle;
      });
    }
    else if (state === 'ended') {
      L10nManager.get('app_title_normal').then((translatedTitle) => {
        document.title = translatedTitle;
      });
    }
  };

  Player.prototype.setVolume = function(operation) {
    // Videojs will check volume's max / min by itself,
    // so we don't have to do extra check
    this.ready().then(() => {
      var currentVolume = this._player.volume();
      switch (operation) {
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
          // nothing
          break;
      }
      Tracker.event('Player', 'set volume', this._player.volume()).send();
    });
  };

  Player.prototype.stop = function() {
    this.ready().then(() => {
      this._player.pause();
      this._player.currentTime(0);
    });
  };

  Player.prototype.playOrPause = function() {
    this.ready().then(() => {
      if (this._player.paused()) {
        this.play();
      }
      else {
        this.pause();
      }
    });
  };

  Player.prototype.pause = function() {
    this.ready().then(() => {
      this._player.pause();
    });
  };

  Player.prototype.play = function(rawTrack) {
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
        this._prepareTrackData(rawTrack)
          .then(this._getRealTrack)
          .then((realTrack) => {
            Tracker.event('Player', 'play', realTrack.platformTrackUrl).send();

            this._playingTrack = realTrack;
            this._player.src(realTrack.platformTrackRealUrl);
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
    });
  };

  var player = new Player();

  // Should be singleton
  return player;
});
