define(function(require) {
  'use strict';

  var BaseTrack = function() {
    this._trackUrlPrefix = '_prefix_';
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
    }
  };

  return BaseTrack;
});
