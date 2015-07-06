define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var BasePlaylist = require('backend/models/playlist/BasePlaylist');
  var Tracker = require('backend/modules/Tracker');
  var DB = require('backend/modules/Database');

  var PlaylistManager = function() {
    EventEmitter.call(this);
    this._playlists = [];

    this._isDisplaying = false;
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

  Object.defineProperty(PlaylistManager.prototype, 'activePlaylist', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._activePlaylist;
    }
  });

  Object.defineProperty(PlaylistManager.prototype, 'isDisplaying', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._isDisplaying;
    }
  });

  PlaylistManager.prototype.init = function() {
    // FIXME
    // not sure why mocha will treat `this` as undefined if we use
    // arrow function inside then()
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
      .then(function(doc) {
        // Transform rawData into real objects
        var playlists = doc.playlists || [];
        this._playlists = playlists.map((rawPlaylist) => {
          return BasePlaylist.fromJSON(rawPlaylist);
        });
      }.bind(this))
      .then(function() {
        // bind needed events for these playlists
        this._playlists.forEach((playlist) => {
          playlist.on('tracksUpdated', () => {
            this._storePlaylistsToDB();
          });
        });
      }.bind(this))
      .catch((error) => {
        console.log(error);
      });
  };

  PlaylistManager.prototype.ready = function() {
    return this._initializedPromise;
  };

  PlaylistManager.prototype.showPlaylistById = function(id) {
    var playlist = this.findPlaylistById(id);
    if (!playlist) {
      console.error('we can\'t find any playlist with id - ', id);
    }
    else {
      this._activePlaylist = playlist;
      this._isDisplaying = true;
      this.emit('shown', playlist);
    }
  };

  PlaylistManager.prototype.hidePlaylist = function() {
    this._activePlaylist = null;
    this._isDisplaying = false;
    this.emit('hidden');
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
    // FIXME
    // this is for testing, fix it later
    var self = this;
    var promise = new Promise((resolve, reject) => {
      var name = options.name;
      var sameNamePlaylist = self.findPlaylistByName(name);
      if (sameNamePlaylist) {
        reject('You already one playlist with same name, ' +
          'please try another one');
      }
      else {
        Tracker.event('PlaylistManager', 'add playlist', name).send();

        // TODO
        // we may support different playlist in the future, for example,
        // we can import playlist from Youtube / Vimeo ... etc,
        // so we can create different one here
        var playlist = new BasePlaylist(options);
        self._playlists.push(playlist);

        playlist.on('tracksUpdated', () => {
          self._storePlaylistsToDB();
        });

        self._storePlaylistsToDB().then(() => {
          self.emit('added', playlist);
          resolve(playlist);
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
    // FIXME
    // this is for testing, fix it later
    var self = this;
    var promise = new Promise((resolve, reject) => {
      var index = self.findPlaylistIndexById(id);
      if (index === -1) {
        reject('Can\'t find the playlist');
      }
      else {
        var removedPlaylist = self._playlists.splice(index, 1);
        self._storePlaylistsToDB().then(() => {
          // TODO
          // we can try to remove listeners from playlist here if needed
          self.emit('removed', removedPlaylist);
          resolve(removedPlaylist);
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
    // FIXME
    // this is for testing, fix it later
    var self = this;

    var index = this.findPlaylistIndexById(id);
    if (index < 0) {
      return Promise.reject('can\'t find playlist id - ', id);
    }
    else {
      Tracker.event('PlaylistManager', 'rename playlist', newName).send();

      var playlist = this._playlists[index];
      playlist.name = newName;
      this._playlists[index] = playlist;

      return this._storePlaylistsToDB().then(() => {
        self.emit('renamed', playlist);
      });
    }
  };

  // singleton
  return new PlaylistManager();
});
