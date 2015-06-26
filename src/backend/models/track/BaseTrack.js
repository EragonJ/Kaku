define(function(require) {
  'use strict';

  var crypto = requireNode('crypto');

  var BaseTrack = function(options) {
    options = options || {};

    this._trackUrlPrefix = '';
    this.id = options.id || crypto.randomBytes(3).toString('hex');
    this.trackType = 'BaseTrack';
    this.title = options.title || 'Unknown Title';
    this.artist = options.artist || 'Unknown Artist';
    this.description = options.description || 'Unknown Description';
    this.platformId = options.platformId || '';
    this.platformTrackRealUrl = options.platformTrackRealUrl || '';
    this.covers = options.covers || {
      default: '',
      medium: '',
      large: ''
    };
  };

  // static method
  BaseTrack.fromJSON = function(json) {
    return new BaseTrack(json);
  };

  BaseTrack.prototype = {
    get platformTrackUrl() {
      return this._trackUrlPrefix + this.platformId;
    },

    isSameTrackWith: function(otherTrack) {
      return this._isSamePlatformUrlWith(otherTrack) ||
        this._isSameTitleAndArtistWith(otherTrack);
    },

    _isSameTitleAndArtistWith: function(otherTrack) {
      return this.artist === otherTrack.artist &&
        this.title === otherTrack.title;
    },

    _isSamePlatformUrlWith: function(otherTrack) {
      return this.platformTrackUrl === otherTrack.platformTrackUrl;
    },

    toJSON: function() {
      return {
        id: this.id,
        trackType: this.trackType,
        title: this.title,
        artist: this.artist,
        description: this.description,
        platformId: this.platformId,
        platformTrackRealUrl: this.platformTrackRealUrl,
        covers: this.covers
      };
    }
  };

  return BaseTrack;
});
