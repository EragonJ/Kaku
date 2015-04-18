define(function(require) {
  'use strict';

  var videojs = require('videojs');
  videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';

  // This should be a wrapper of Videojs and expose
  // needed events / API out for callee to use
  var Player = function() {
    this._playerDOM = null;
    this._player = null;
  };

  Player.prototype = {
    _setupPlayer: function() {
      this._player.width('100%');
      this._player.height('auto');
      this._player.bigPlayButton.hide();
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
    }
  };

  var player = new Player();

  // Should be singleton
  return player;
});
