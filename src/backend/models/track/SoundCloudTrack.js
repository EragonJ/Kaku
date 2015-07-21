define(function(require) {
  'use strict';

  var BaseTrack = require('backend/models/track/BaseTrack');
  var SoundCloudTrack = function(options) {
    BaseTrack.call(this, options);

    this.trackType = 'SoundCloudTrack';
    this._trackUrlPrefix = 'https://soundcloud.com/';
  };

  SoundCloudTrack.prototype = Object.create(BaseTrack.prototype);
  SoundCloudTrack.prototype.constructor = SoundCloudTrack;

  SoundCloudTrack.prototype.init = function(options) {
    // Reference:
    // https://developers.soundcloud.com/docs/api/reference#tracks
    //
    // NOTE:
    // In SoundCloud, `id` is useless to let us match the right track,
    // we have to use permalink_url instead.
    if (!options.permalink_url) {
      // TODO
      // extract debug logic into a simple function
      console.error('SoundCloudTrack');
      console.error('there is something wrong in passing object');
      console.error(options);
    }
    else {
      // e.g. http://soundcloud.com/bryan/sbahn-sounds
      // will be bryan/sbahn-sounds
      this.platformId =
        options.permalink_url.replace(this._trackUrlPrefix, '');

      if (options.title) {
        this.title = options.title;
      }

      if (options.description) {
        this.description = options.description;
      }

      if (options.user && options.user.username) {
        this.artist = options.user && options.user.username;
      }

      if (options.artwork_url) {
        // t500x500: 500×500
        // crop: 400×400
        // t300x300: 300×300
        // large: 100×100 (default)
        // t67x67: 67×67 (only on artworks)
        // badge: 47×47
        // small: 32×32
        // tiny: 20×20 (on artworks)
        // tiny: 18×18 (on avatars)
        // mini: 16×16
        this.covers.default = options.artwork_url.replace('large', 'crop');
        this.covers.large = this.covers.default;
        this.covers.medium = options.artwork_url.replace('large', 't300x300');
      }
    }
  };

  return SoundCloudTrack;
});
