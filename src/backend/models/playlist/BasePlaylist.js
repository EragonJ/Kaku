define(function(require) {
  'use strict';

  var crypto = requireNode('crypto');
  var EventEmitter = requireNode('events').EventEmitter;

  var supportedTracks = {
    BaseTrack: require('backend/models/track/BaseTrack'),
    YoutubeTrack: require('backend/models/track/YoutubeTrack'),
    VimeoTrack: require('backend/models/track/VimeoTrack')
  };

  var BasePlaylist = function(options) {
    options = options || {};

    EventEmitter.call(this);
    this.id = options.id || crypto.randomBytes(3).toString('hex');
    this.name = options.name || 'playlist';
    this.type = options.type || 'normal';
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
    var self = this;
    var promise = new Promise((resolve, reject) => {
      var title = track.title;
      var artist = track.artist;
      var foundTrack = self.findTrackByArtistAndTitle(artist, title);
      if (foundTrack) {
        reject('You already have a track with same name & artist, ' +
          'please try another one');
      }
      else {
        self._tracks.push(track);
        self.emit('tracksUpdated');
        resolve();
      }
    });
    return promise;
  };

  BasePlaylist.prototype.removeTrack = function(track) {
    var self = this;
    var promise = new Promise((resolve, reject) => {
      var index = self.findTrackIndex(track);
      if (index === -1) {
        reject('Can\'t find the track');
      }
      else {
        var removedTrack = self._tracks.splice(index, 1);
        console.log('Removed track - ', removedTrack);

        self.emit('tracksUpdated');
        resolve();
      }
    });
    return promise;
  };

  BasePlaylist.prototype.findTrackIndex = function(track) {
    return this._tracks.indexOf(track);
  };

  BasePlaylist.prototype.findTrackByArtistAndTitle = function(artist, title) {
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
      type: this.type,
      _tracks: tracks
    };
  };

  return BasePlaylist;
});
