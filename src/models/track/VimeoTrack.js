var BaseTrack = require('./BaseTrack');

function VimeoTrack(options) {
  BaseTrack.call(this, options);

  this.trackType = 'VimeoTrack';
  this._trackUrlPrefix = 'https://vimeo.com/';
}

VimeoTrack.prototype = Object.create(BaseTrack.prototype);

VimeoTrack.prototype.constructor = VimeoTrack;

VimeoTrack.prototype.init = function(options) {
  if (!options.link || !options.pictures) {
    console.error('there is something wrong in passing object');
    console.error(options);
  }
  else {
    this.title = options.name;
    this.description = options.description;
    this.platformId = options.uri.match(/\d+$/)[0];

    // we will loop from backward to keep every needed picture
    var covers = options.pictures.sizes;
    for (var i = covers.length - 1; i >= 0; i--) {
      var link = covers[i].link;

      if (!this.covers.large) {
        this.covers.large = link;
      }
      else if (!this.covers.medium) {
        this.covers.medium = link;
      }
      else if (!this.covers.default) {
        this.covers.default = link;
      }
      else {
        break;
      }
    }
  }
};

module.exports = VimeoTrack;
