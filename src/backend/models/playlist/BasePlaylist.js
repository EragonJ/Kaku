define(function(require) {
  'use strict';

  var crypto = requireNode('crypto');
  var EventEmitter = requireNode('events').EventEmitter;

  var supportedTracks = {
    BaseTrack: require('backend/models/track/BaseTrack'),
    YoutubeTrack: require('backend/models/track/YoutubeTrack')
  };

  var BasePlaylist = function(options = {}) {
    EventEmitter.call(this);
    this.id = options.id || crypto.randomBytes(3).toString('hex');
    this.name = options.name || 'playlist';
    this._tracks = options._tracks || [];
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

  // static method
  BasePlaylist.fromJSON = function(json) {
    var tracks = json._tracks.map((rawTrackInfo) => {
      var trackType = rawTrackInfo.trackType;
      var trackConstructor = supportedTracks[trackType];
      if (!trackConstructor) {
        console.error('This track may lose some data, let\'s just drop it');
        return;
      }
      else {
        return new trackConstructor(rawTrackInfo);
      }
    });

    // TODO
    // we may need to support different playlist here
    return new BasePlaylist({
      id: json.id,
      name: json.name,
      _tracks: tracks
    });
  };

  BasePlaylist.prototype.addTrack = function(track) {
    // TODO
    // track should already be an instance of BaseTrack,
    // if not, we may have to do something here
    var promise = new Promise((resolve, reject) => {
      var title = track.title;
      var artist = track.artist;
      var foundTrack = this.findTrackByTitleAndArtist(title, artist);
      if (foundTrack) {
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

  BasePlaylist.prototype.removeTrackById = function(id) {
    var promise = new Promise((resolve, reject) => {
      var index = this.findTrackIndexById(id);
      if (index === -1) {
        reject('Can\'t find the track');
      }
      else {
        this._tracks.splice(index, 1);
        this.emit('tracksUpdated');
        resolve();
      }
    });
    return promise;
  };

  BasePlaylist.prototype.findTrackIndexById = function(id) {
    var tracks = this._tracks.filter((track) => {
      return track.id === id;
    });
    return tracks[0];
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

  BasePlaylist.prototype.isSameWith = function(anotherPlaylist) {
    return this.id === anotherPlaylist.id;
  };

  BasePlaylist.prototype.toJSON = function() {
    var tracks = this._tracks.map((track) => {
      return track.toJSON();
    });

    return {
      id: this.id,
      name: this.name,
      _tracks: tracks
    };
  };

  return BasePlaylist;
});
