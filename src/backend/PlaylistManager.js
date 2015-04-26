define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var BasePlaylist = require('backend/models/playlist/BasePlaylist');

  var PlaylistManager = function() {
    EventEmitter.call(this);
    this._playlists = [];
    this._activePlaylist = null;
  };

  PlaylistManager.prototype = Object.create(EventEmitter.prototype);
  PlaylistManager.constructor = PlaylistManager;

  Object.defineProperty(PlaylistManager.prototype, 'playlists', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._playlists;
    }
  });

  PlaylistManager.prototype.displayPlaylistById = function(id) {
    var playlist = this.findPlaylistById(id);
    if (!playlist) {
      console.error('we can\'t find any playlist with id - ', id);
    }
    else {
      this._activePlaylist = playlist;
      this.emit('shown', playlist);
    }
  };

  PlaylistManager.prototype.addNormalPlaylist = function(name) {
    return this._addPlaylist({
      type: 'normal',
      name: name
    });
  };


  PlaylistManager.prototype.addYoutubePlaylist = function(youtubeId, name) {
    return this._addPlaylist({
      type: 'youtube',
      name: name,
      id: youtubeId
    });
  };

  PlaylistManager.prototype._addPlaylist = function(options) {
    var promise = new Promise((resolve, reject) => {
      var name = options.name;
      var sameNamePlaylist = this.findPlaylistByName(name);
      if (sameNamePlaylist) {
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

        this.emit('added', playlist);
        resolve();
      }
    });
    return promise;
  };

  PlaylistManager.prototype.removePlaylistById = function(id) {
    var promise = new Promise((resolve, reject) => {
      var index = this.findPlaylistIndexById(id);
      if (index === -1) {
        reject('Can\'t find the playlist');
      }
      else {
        var removedPlaylist = this._playlists.splice(index, 1);
        this.emit('removed', removedPlaylist);
        resolve();
      }
    });
    return promise;
  };

  PlaylistManager.prototype.findPlaylistIndexById = function(id) {
    var playlist = this.findPlaylistById(id);
    return this._playlists.indexOf(playlist);
  };

  PlaylistManager.prototype.findPlaylistById = function(id) {
    var playlists = this._playlists.filter((playlist) => {
      return playlist.id === id;
    });

    // id is unique
    return playlists[0];
  };

  PlaylistManager.prototype.findPlaylistIndexByName = function(name) {
    var playlist = this.findPlaylistByName(name);
    return this._playlists.indexOf(playlist);
  };

  PlaylistManager.prototype.findPlaylistByName = function(name) {
    var playlists = this._playlists.filter((playlist) => {
      return playlist.name === name;
    });

    // name is unique
    return playlists[0];
  };

  PlaylistManager.prototype.renamePlaylistById = function(id, newName) {
    var index = this.findPlaylistIndexById(id);
    if (index < 0) {
      return Promise.reject('can\'t find playlist id - ', id);
    }
    else {
      var playlist = this._playlists[index];
      playlist.name = newName;
      this._playlists[index] = playlist;

      this.emit('renamed', playlist);
      return Promise.resolve();
    }
  };

  // singleton
  return new PlaylistManager();
});
