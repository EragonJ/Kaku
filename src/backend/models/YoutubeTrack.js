define(function(require) {
  'use strict';

  var BaseTrack = require('backend/models/BaseTrack');
  var YoutubeTrack = function(o) {
    BaseTrack.call(this);

    this._trackUrlPrefix = 'https://www.youtube.com/watch?v=';

    if (!o.id || !o.snippet) {
      console.error('there is something wrong in passing object');
      console.error(o);
    } else {
      this.title = o.snippet.title;
      this.description = o.snippet.description;
      this.platformId = o.id.videoId;

      if (o.snippet.thumbnails) {
        this.covers.default =
          o.snippet.thumbnails &&
          o.snippet.thumbnails.default && o.snippet.thumbnails.default.url;

        this.covers.medium =
          o.snippet.thumbnails &&
          o.snippet.thumbnails.medium && o.snippet.thumbnails.medium.url;

        this.covers.large =
          o.snippet.thumbnails &&
          o.snippet.thumbnails.high && o.snippet.thumbnails.high.url;
      }
    }
  };

  YoutubeTrack.prototype = Object.create(BaseTrack.prototype);
  YoutubeTrack.prototype.constructor = YoutubeTrack;

  return function ctor_youtube_track(objectFromYoutube) {
    return new YoutubeTrack(objectFromYoutube);
  };
});
