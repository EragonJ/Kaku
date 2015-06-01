define(function(require) {
  'use strict';

  var BaseTrack = require('backend/models/track/BaseTrack');
  var YoutubeTrack = function(options) {
    BaseTrack.call(this);

    this.trackType = 'YoutubeTrack';
    this._trackUrlPrefix = 'https://www.youtube.com/watch?v=';

    if (!options.id || !options.snippet) {
      console.error('there is something wrong in passing object');
      console.error(options);
    } else {
      this.title = options.snippet.title;
      this.description = options.snippet.description;
      this.platformId = options.id.videoId;

      if (options.snippet.thumbnails) {
        this.covers.default =
          options.snippet.thumbnails &&
          options.snippet.thumbnails.default &&
          options.snippet.thumbnails.default.url;

        this.covers.medium =
          options.snippet.thumbnails &&
          options.snippet.thumbnails.medium &&
          options.snippet.thumbnails.medium.url;

        this.covers.large =
          options.snippet.thumbnails &&
          options.snippet.thumbnails.high &&
          options.snippet.thumbnails.high.url;
      }
    }
  };

  YoutubeTrack.prototype = Object.create(BaseTrack.prototype);
  YoutubeTrack.prototype.constructor = YoutubeTrack;

  return function ctor_youtube_track(objectFromYoutube) {
    return new YoutubeTrack(objectFromYoutube);
  };
});
