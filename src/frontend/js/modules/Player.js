define(function(require) {
  'use strict';

  var remote = requireNode('remote');
  var dialog = remote.require('dialog');

  var globalShortcut = remote.require('global-shortcut');
  var EventEmitter = requireNode('events').EventEmitter;

  var Notifier = require('modules/Notifier');
  var videojs = require('videojs');

  var TrackInfoFetcher = require('backend/modules/TrackInfoFetcher');
  var DownloadManager = require('backend/modules/DownloadManager');
  var HistoryManager = require('backend/modules/HistoryManager');
  var L10nManager = require('backend/modules/L10nManager');
  var KakuCore = require('backend/modules/KakuCore');
  var Searcher = require('backend/modules/Searcher');
  var Tracker = require('backend/modules/Tracker');

  videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

  // This should be a wrapper of Videojs and expose
  // needed events / API out for callee to use
  var Player = function() {
    EventEmitter.call(this);

    this._playingTrack = null;
    this._playerRepeatMode = 'no';
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

  Player.prototype._bindGlobalShortcuts = function() {
    // In order not to call pre-registered callbacks in released render view,
    // we have to unregisterAll callbacks at first, then register again.
    globalShortcut.unregisterAll();

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

    globalShortcut.register('CmdOrCtrl+D', () => {
      this.downloadCurrentTrack();
    });

    // Note
    // we will register/unregister escape key only when fullscreen is
    // triggerd, otherwise, users can't use this key in different applications.
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

    this._player.on('fullscreenchange', () => {
      if (this._player.isFullscreen()) {
        globalShortcut.register('Escape', () => {
          this._player.exitFullscreen();
        });
      }
      else {
        globalShortcut.unregister('Escape');
      }
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
      if (this._pendingTrackIndex > this._pendingTracks.length - 1) {
        this._pendingTrackIndex = 0;
      }
      else {
        this._pendingTrackIndex += 1;
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
    if (state === 'play') {
      L10nManager.get('app_title_playing', {
        name: this._playingTrack.title
      }).then((translatedTitle) => {
        var maxLength = 40;
        if (translatedTitle.length > maxLength) {
          translatedTitle = translatedTitle.substr(0, maxLength) + ' ...';
        }
        KakuCore.title = translatedTitle;
      });
    }
    else if (state === 'ended') {
      L10nManager.get('app_title_normal').then((translatedTitle) => {
        KakuCore.title = translatedTitle;
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
        this._prepareTrackData(rawTrack).then((foundTrack) => {
          // we did find a track from searcher
          if (foundTrack) {
            this._getRealTrack(foundTrack).then((realTrack) => {
              Tracker.event('Player', 'play',
                realTrack.platformTrackUrl).send();

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

      dialog.showSaveDialog({
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

  var player = new Player();

  // Should be singleton
  return player;
});
