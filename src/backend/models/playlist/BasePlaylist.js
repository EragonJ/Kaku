define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var crypto = requireNode('crypto');

  var BasePlaylist = function(options) {
    EventEmitter.call(this);
    this.id = crypto.randomBytes(3).toString('hex');
    this.name = options.name || 'playlist';
    this._tracks = [];
  };

  BasePlaylist.prototype = Object.create(EventEmitter.prototype);
  BasePlaylist.constructor = BasePlaylist;

  Object.defineProperty(BasePlaylist.prototype, 'tracks', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._tracks;
    }
  });

  BasePlaylist.prototype.addTrack = function(track) {
    // TODO
    // track should already be an instance of BaseTrack,
    // if not, we may have to do something here
    var promise = new Promise((resolve, reject) => {
      var title = track.title;
      var artist = track.artist;
      var foundTrack = this.findTrackByTitleAndArtist(title, artist);
      if (foundTrack.length > 0) {
        reject('You already have a track with same name & artist, ' +
          'please try another one');
      }
      else {
        this._tracks.push(track);
        this.emit('tracksUpdated');
        resolve();
      }
    });
    return promise;
  };

  BasePlaylist.prototype.removeTrack = function(title, artist) {
    var promise = new Promise((resolve, reject) => {
      var index = this.findTrackIndexByTitleAndArtist(title, artist);
      if (index === -1) {
        reject('Can\'t find the track');
      }
      else {
        this._tracks.splice(index, 1);
        resolve();
      }
    });
    return promise;
  };

  BasePlaylist.prototype.findTrackIndexByTitleAndArtist =
    function(title, artist) {
      var track = this.findTrackByTitleAndArtist(title, artist);
      return this._tracks.indexOf(track);
  };

  BasePlaylist.prototype.findTrackByTitleAndArtist = function(title, artist) {
    // We assume that there is only one track with same title & artist
    var tracks = this._tracks.filter((track) => {
      return (track.title === title) && (track.artist === artist);
    });
    return tracks[0];
  };

  BasePlaylist.prototype.findTracksByTitle = function(title) {
    return this._tracks.filter((track) => {
      return track.title === title;
    });
  };

  BasePlaylist.prototype.findTracksByArtist = function(artist) {
    return this._tracks.filter((track) => {
      return track.artist === artist;
    });
  };

  return BasePlaylist;
});
