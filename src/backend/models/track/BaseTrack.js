define(function(require) {
  'use strict';

  var BaseTrack = function() {
    this._trackUrlPrefix = '';
    this.title = 'Unknown Title';
    this.artist = 'Unknown Artist';
    this.description = 'Unknown Description';
    this.platformId = '';
    this.platformTrackRealUrl = '';
    this.covers = {
      default: '',
      medium: '',
      large: ''
    };
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
    }
  };

  return BaseTrack;
});
