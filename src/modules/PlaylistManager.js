const { EventEmitter } = require('events');
const BasePlaylist = require('kaku-core/models/playlist/BasePlaylist');
const Tracker = require('./Tracker');
const DB = require('./Database');

class PlaylistManager extends EventEmitter {
  constructor() {
    super();
    this._playlists = [];

    this._isDisplaying = false;
    this._activePlaylist = null;

    // we have to initialize playlist from db
    this._initializedPromise = this.init();

    Object.defineProperty(PlaylistManager.prototype, 'playlists', {
      enumerable: true,
      configurable: false,
      get() {
        return this._playlists;
      }
    });

    Object.defineProperty(PlaylistManager.prototype, 'activePlaylist', {
      enumerable: true,
      configurable: false,
      get() {
        return this._activePlaylist;
      }
    });

    Object.defineProperty(PlaylistManager.prototype, 'isDisplaying', {
      enumerable: true,
      configurable: false,
      get() {
        return this._isDisplaying;
      }
    });
  }

  init() {
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
        let playlists = doc.playlists || [];
        this._playlists = playlists.map((rawPlaylist) => {
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
  }

  ready() {
    return this._initializedPromise;
  }

  showPlaylistById(id) {
    const playlist = this.findPlaylistById(id);
    if (!playlist) {
      console.error('we can\'t find any playlist with id - ', id);
    }
    else {
      this._activePlaylist = playlist;
      this._isDisplaying = true;
      this.emit('shown', playlist);
    }
  }

  hidePlaylist() {
    this._activePlaylist = null;
    this._isDisplaying = false;
    this.emit('hidden');
  }

  addNormalPlaylist(name) {
    return this._addPlaylist({
      type: 'normal',
      name: name
    });
  }

  addYoutubePlaylist(name, youtubeId) {
    return this._addPlaylist({
      type: 'youtube',
      name: name,
      platformid: youtubeId
    });
  }

  _addPlaylist(options) {
    const promise = new Promise((resolve, reject) => {
      const name = options.name;
      const sameNamePlaylist = this.findPlaylistByName(name);
      if (sameNamePlaylist) {
        reject('You already had one playlist with the same name - ' + name +
          ', so please try another one !');
      }
      else {
        Tracker.event('PlaylistManager', 'add playlist', name).send();

        // TODO
        // we may support different playlist in the future, for example,
        // we can import playlist from Youtube / Vimeo ... etc,
        // so we can create different one here
        const playlist = new BasePlaylist(options);
        this._playlists.push(playlist);

        this.emit('added', playlist);

        playlist.on('tracksUpdated', () => {
          this._storePlaylistsToDB();
        });

        this._storePlaylistsToDB().then(() => {
          resolve(playlist);
        });
      }
    });
    return promise;
  }

  _importPlaylist(options) {
    const name = options.name;
    const sameNamePlaylist = this.findPlaylistByName(name);
    if (sameNamePlaylist) {
      // This should not happen because we will cleanup db before importing,
      // so in order to make the other importing process work as usual,
      // the better way is to resolve it directly.
    }
    else {
      var playlist = BasePlaylist.fromJSON(options);
      this._playlists.push(playlist);

      playlist.on('tracksUpdated', () => {
        this._storePlaylistsToDB();
      });

      this.emit('added', playlist);
    }
  }

  _storePlaylistsToDB() {
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
  }

  removePlaylistById(id) {
    const promise = new Promise((resolve, reject) => {
      const index = this.findPlaylistIndexById(id);
      if (index === -1) {
        reject('Can\'t find the playlist');
      }
      else {
        const removedPlaylist = this._playlists.splice(index, 1);
        this._storePlaylistsToDB().then(() => {
          // TODO
          // we can try to remove listeners from playlist here if needed
          this.emit('removed', removedPlaylist);
          resolve(removedPlaylist);
        });
      }
    });
    return promise;
  }

  findPlaylistIndexById(id) {
    const playlist = this.findPlaylistById(id);
    return this._playlists.indexOf(playlist);
  }

  findPlaylistById(id) {
    const playlists = this._playlists.filter((playlist) => {
      return playlist.id === id;
    });

    // id is unique
    return playlists[0];
  }

  findPlaylistIndexByName(name) {
    const playlist = this.findPlaylistByName(name);
    return this._playlists.indexOf(playlist);
  }

  findPlaylistByName(name) {
    const playlists = this._playlists.filter((playlist) => {
      return playlist.name === name;
    });

    // name is unique
    return playlists[0];
  }

  renamePlaylistById(id, newName) {
    const index = this.findPlaylistIndexById(id);
    if (index < 0) {
      return Promise.reject('can\'t find playlist id - ', id);
    }
    else {
      Tracker.event('PlaylistManager', 'rename playlist', newName).send();

      let playlist = this._playlists[index];
      playlist.name = newName;
      this._playlists[index] = playlist;

      return this._storePlaylistsToDB().then(() => {
        this.emit('renamed', playlist);
      });
    }
  }

  export() {
    const result = this.playlists.map((playlist) => {
      return playlist.toJSON();
    });
    return result;
  }

  cleanup() {
    const promises = this.playlists.map((playlist) => {
      return this.removePlaylistById(playlist.id);
    });
    return Promise.all(promises).then(() => {
      this.emit('cleanup');
    });
  }

  import(playlistObjects) {
    playlistObjects.map((playlistObject) => {
      return this._importPlaylist(playlistObject);
    });
    return this._storePlaylistsToDB().then(() => {
      this.emit('imported');
    });
  }
}

module.exports = new PlaylistManager();
