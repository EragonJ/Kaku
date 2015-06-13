define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var TrackInfoFetcher = require('backend/TrackInfoFetcher');
  var Searcher = require('backend/Searcher');
  var HistoryManager = require('backend/HistoryManager');
  var L10nManager = require('backend/L10nManager');
  var Notifier = require('modules/Notifier');
  var videojs = require('videojs');
  videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

  // This should be a wrapper of Videojs and expose
  // needed events / API out for callee to use
  var Player = function() {
    EventEmitter.call(this);

    this._playingTrack = null;
    this._playerDOM = null;
    this._player = null;

    this._inPlayAllMode = false;

    // TODO
    // If users click on track, we have to update this index ?
    this._pendingTrackIndex = 0;
    this._pendingTracks = [];
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

  Player.prototype._getDefaultVideoJSConfig = function() {
    return {
      width: '100%',
      height: 'auto',
      autoplay: false,
      bigPlayButton: false,
      controls: true,
      controlBar: {
        playToggle: false,
        fullscreenToggle: false,
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
    if (this._player) {
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
    this._inPlayAllMode = true;

    // then play the first one !
    this.play(this._pendingTracks[this._pendingTrackIndex]);
  };

  Player.prototype.playNextTrack = function() {
    if (this._pendingTrackIndex > this._pendingTracks.length - 1) {
      // we are in the end
      this._pendingTracks = [];
      this._inPlayAllMode = false;
    }
    else {
      this._pendingTrackIndex += 1;
      this.play(this._pendingTracks[this._pendingTrackIndex]);
    }
  };

  Player.prototype.playPreviousTrack = function() {
    if (this._pendingTrackIndex < 0) {
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

  Player.prototype.play = function(rawTrack) {
    this.ready().then(() => {
      this._player.pause();
      this._toggleSpinner(true);

      this._prepareTrackData(rawTrack)
        .then(this._getRealTrack)
        .then((realTrack) => {
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
    });
  };

  var player = new Player();

  // Should be singleton
  return player;
});
