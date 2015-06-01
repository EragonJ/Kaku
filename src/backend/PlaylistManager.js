define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var BasePlaylist = require('backend/models/playlist/BasePlaylist');
  var DB = require('backend/Database');

  var PlaylistManager = function() {
    EventEmitter.call(this);
    this._playlists = [];
    this._activePlaylist = null;

    // we have to initialize playlist from db
    this._initializedPromise = this.init();
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

  PlaylistManager.prototype.init = function() {
    return DB.get('playlists')
      .catch((error) => {
        if (error.status === 404) {
          return DB.put({
            _id: 'playlists',
            playlists: []
          });
        }
        else {
          throw error;
        }
      })
      .then((doc) => {
        // Transform rawData into real objects
        this._playlists = doc.playlists.map((rawPlaylist) => {
          return BasePlaylist.fromJSON(rawPlaylist);
        });
      })
      .then(() => {
        // bind needed events for these playlists
        this._playlists.forEach((playlist) => {
          playlist.on('tracksUpdated', () => {
            this._storePlaylistsToDB();
          });
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  PlaylistManager.prototype.ready = function() {
    return this._initializedPromise;
  };

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

        playlist.on('tracksUpdated', () => {
          this._storePlaylistsToDB();
        });

        this._storePlaylistsToDB().then(() => {
          this.emit('added', playlist);
          resolve();
        });
      }
    });
    return promise;
  };

  PlaylistManager.prototype._storePlaylistsToDB = function() {
    return DB.get('playlists').then((doc) => {
      return DB.put({
        _id: 'playlists',
        _rev: doc._rev,
        playlists: this._playlists.map((playlist) => {
         return playlist.toJSON();
        })
      });
    })
    .catch((error) => {
      console.log(error);
    });
  };

  PlaylistManager.prototype.removePlaylistById = function(id) {
    var promise = new Promise((resolve, reject) => {
      var index = this.findPlaylistIndexById(id);
      if (index === -1) {
        reject('Can\'t find the playlist');
      }
      else {
        var removedPlaylist = this._playlists.splice(index, 1);
        this._storePlaylistsToDB().then(() => {
          // TODO
          // we can try to remove listeners from playlist here if needed
          this.emit('removed', removedPlaylist);
          resolve();
        });
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

      return this._storePlaylistsToDB().then(() => {
        this.emit('renamed', playlist);
      });
    }
  };

  // singleton
  return new PlaylistManager();
});
