import DB from './Database';
import { EventEmitter } from 'events';
import BaseTrack from 'kaku-core/models/track/BaseTrack';

var HistoryManager = function() {
  EventEmitter.call(this);

  this._tracks = [];
  this._initializedPromise = null;
};

HistoryManager.prototype = Object.create(EventEmitter.prototype);
HistoryManager.constructor = HistoryManager;

Object.defineProperty(HistoryManager.prototype, 'tracks', {
  enumerable: true,
  configurable: false,
  get: function() {
    return this._tracks;
  }
});

HistoryManager.prototype.ready = function() {
  return this.init();
};

HistoryManager.prototype.init = function() {
  if (this._initializedPromise) {
    return this._initializedPromise;
  }
  else {
    this._initializedPromise = DB.get('history').catch((error) => {
      if (error.status === 404) {
        return DB.put({
          _id: 'history',
          tracks: []
        });
      }
      else {
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
};

HistoryManager.prototype.add = function(track) {
  if (!this._hasTrack(track)) {
    this._tracks.unshift(track);
    this.emit('history-updated', this._tracks);
  }
};

HistoryManager.prototype.remove = function(track) {
  if (this._hasTrack(track)) {
    var index = this._getTrackIndex(track);
    this._tracks.splice(index, 1);
    this.emit('history-updated', this._tracks);
  }
};

HistoryManager.prototype.clean = function() {
  this._tracks = [];
  this.emit('history-updated', this._tracks);
};

HistoryManager.prototype._hasTrack = function(track) {
  var index = this._getTrackIndex(track);
  return index !== -1;
};

HistoryManager.prototype._getTrackIndex = function(track) {
  return this._tracks.indexOf(track);
};

HistoryManager.prototype._storeTracksToDB = function() {
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
};

module.exports = new HistoryManager();
