define(function(require) {
  'use strict';

  // TODO
  // add DB support for this Manager later

  var EventEmitter = requireNode('events').EventEmitter;

  var HistoryManager = function() {
    EventEmitter.call(this);

    this._tracks = [];
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

  HistoryManager.prototype.add = function(track) {
    if (!this._hasTrack(track)) {
      this._tracks.push(track);
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

  // singleton
  return new HistoryManager();
});
