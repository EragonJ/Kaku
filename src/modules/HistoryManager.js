const DB = require('./Database');
const { EventEmitter } = require('events');
const BaseTrack = require('kaku-core/models/track/BaseTrack');

class HistoryManager extends EventEmitter {
  constructor() {
    super();
    this._tracks = [];
    this._initializedPromise = null;

    Object.defineProperty(HistoryManager.prototype, 'tracks', {
      enumerable: true,
      configurable: false,
      get() {
        return this._tracks;
      }
    });
  }

  ready() {
    return this.init();
  }

  init() {
    if (this._initializedPromise) {
      return this._initializedPromise;
    } else {
      this._initializedPromise = DB.get('history').catch((error) => {
        if (error.status === 404) {
          return DB.put({
            _id: 'history',
            tracks: []
          });
        } else {
          throw error;
        }
      })
      .then((doc) => {
        let tracks = doc.tracks || [];
        this._tracks = tracks.map((rawTrack) => {
          return BaseTrack.fromJSON(rawTrack);
        });
      })
      .then(() => {
        // bind needed events for these playlists
        this.on('history-updated', () => {
          this._storeTracksToDB();
        });
      })
      .catch((error) => {
        console.log(error);
      });

      return this._initializedPromise;
    }
  }

  add(track) {
    if (!this._hasTrack(track)) {
      this._tracks.unshift(track);
      this.emit('history-updated', this._tracks);
    }
  }

  remove(track) {
    if (this._hasTrack(track)) {
      const index = this._getTrackIndex(track);
      this._tracks.splice(index, 1);
      this.emit('history-updated', this._tracks);
    }
  }

  clean() {
    this._tracks = [];
    this.emit('history-updated', this._tracks);
  }

  _hasTrack(track) {
    const index = this._getTrackIndex(track);
    return index !== -1;
  }

  _getTrackIndex(track) {
    return this._tracks.indexOf(track);
  }

  _storeTracksToDB() {
    return DB.get('history').then((doc) => {
      return DB.put({
        _id: 'history',
        _rev: doc._rev,
        tracks: this._tracks.map((track) => {
          return track.toJSON();
        })
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }
}

module.exports = new HistoryManager();
