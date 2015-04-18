define(function(require) {
  'use strict';

  var BasePlaylist = require('backend/models/playlist/BasePlaylist');

  var PlaylistManager = function() {
    this._playlists = [];
  };

  PlaylistManager.prototype = {
    get playlists() {
      return this._playlists;
    },

    addNormalPlaylist: function(name) {
      return this._addPlaylist({
        type: 'normal',
        name: name
      });
    },

    addYoutubePlaylist: function(youtubeId, name) {
      return this._addPlaylist({
        type: 'youtube',
        name: name,
        id: youtubeId
      });
    },

    _addPlaylist: function(options) {
      var promise = new Promise((resolve, reject) => {
        var name = options.name;
        var sameNamePlaylist = this.findPlaylistByName(name);
        if (sameNamePlaylist.length > 0) {
          reject('You already one playlist with same name, ' +
            'please try another one');
        }
        else {
          // TODO
          // we may support different playlist in the future, for example,
          // we can import playlist from Youtube / Vimeo ... etc,
          // so we can create different one here
          var playlist = new BasePlaylist(options);
          this._playlists.push(playlist);
          resolve();
        }
      });
      return promise;
    },

    removePlaylist: function(name) {
      var promise = new Promise((resolve, reject) => {
        var index = this.findPlaylistIndexByName(name);
        if (index === -1) {
          reject('Can\'t find the playlist');
        }
        else {
          this._playlists.splice(index, 1);
          resolve();
        }
      });
      return promise;
    },

    findPlaylistById: function(id) {
      return this._playlists.filter((playlist) => {
        return playlist.id === id;
      });
    },

    findPlaylistIndexByName: function(name) {
      var playlist = this.findPlaylistByName(name);
      return this._playlists.indexOf(playlist);
    },

    findPlaylistByName: function(name) {
      return this._playlists.filter((playlist) => {
        return playlist.name === name; 
      });
    }
  };

  // singleton
  return new PlaylistManager();
});
