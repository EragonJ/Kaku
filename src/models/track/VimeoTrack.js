var BaseTrack = require('./BaseTrack');

function VimeoTrack(options) {
  BaseTrack.call(this, options);

  this.trackType = 'VimeoTrack';
  this._trackUrlPrefix = 'https://vimeo.com/';
}

VimeoTrack.prototype = Object.create(BaseTrack.prototype);

VimeoTrack.prototype.constructor = VimeoTrack;

VimeoTrack.prototype.init = function(options) {
  if (!options.link) {
    console.error('there is something wrong in passing object');
    console.error(options);
  }
  else {
    this.title = options.name;
    this.description = options.description;
    this.platformId = options.uri.match(/\d+$/)[0];

    if (options.user && options.user.name) {
      this.artist = options.user.name;
    }

    var covers = options.pictures && options.pictures.sizes || [];

    if (covers.length > 0) {
      this.covers.large =
        this.covers.medium =
          this.covers.default =
            covers[covers.length - 1].link;
    }
  }
};

module.exports = VimeoTrack;
