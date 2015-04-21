define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var TrackInfoFetcher = require('backend/TrackInfoFetcher');
  var videojs = require('videojs');
  videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

  // This should be a wrapper of Videojs and expose
  // needed events / API out for callee to use
  var Player = function() {
    this._playingTrack = null;
    this._playerDOM = null;
    this._player = null;
  };

  Player.prototype = {
    _setupPlayer: function() {
      this._player.width('100%');
      this._player.height('auto');
      this._player.bigPlayButton.hide();
    },

    _getRealTrack: function(track) {
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
    },

    _addToPlayedHistories: function(track) {
      // TODO
      // we have to add backend/histories for this
      // save this track to playedTracks
      var playedTracks = CoreData.get('playedTracks');
      playedTracks.push(track);
      CoreData.set('playedTracks', playedTracks);
    },

    get playingTrack() {
      return this._playingTrack;
    },

    setPlayer: function(playerDOM) {
      this._playerDOM = playerDOM;
    },

    ready: function() {
      if (this._player) {
        return Promise.resolve(this._player);
      }
      else {
        var self = this;
        var promise = new Promise((resolve) => {
          videojs(this._playerDOM).ready(function() {
            self._player = this;
            self._setupPlayer();
            // return real videojs-ed player out
            resolve(self._player);
          });
        });
        return promise;
      }
    },

    play: function(rawTrack) {
      this.ready().then(() => {
        this._getRealTrack(rawTrack).then((realTrack) => {
          this._playingTrack = realTrack;
          this._player.src(realTrack.platformTrackRealUrl);
          this._player.play();
          this._addToPlayedHistories(realTrack);
        });
      });
    }
  };

  var player = new Player();

  // Should be singleton
  return player;
});
