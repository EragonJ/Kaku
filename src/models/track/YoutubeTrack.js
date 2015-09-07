var BaseTrack = require('./BaseTrack');

function YoutubeTrack(options) {
  BaseTrack.call(this, options);

  this.trackType = 'YoutubeTrack';
  this._trackUrlPrefix = 'https://www.youtube.com/watch?v=';
}

YoutubeTrack.prototype = Object.create(BaseTrack.prototype);

YoutubeTrack.prototype.constructor = YoutubeTrack;

YoutubeTrack.prototype.initYoutubeResult = function(options) {
  if (!options.id || !options.snippet) {
    console.error('there is something wrong in passing object');
    console.error(options);
  } else {
    this.title = options.snippet.title;
    this.description = options.snippet.description;

    // from Youtube > Search
    if (options.id && options.id.videoId) {
      this.platformId = options.id.videoId;
    }
    // from Youtube > playlistItem
    else if (options.snippet.resourceId && options.snippet.resourceId.videoId) {
      this.platformId = options.snippet.resourceId.videoId;
    }

    if (options.snippet.channelTitle) {
      this.artist = options.snippet.channelTitle;
    }

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

module.exports = YoutubeTrack;
