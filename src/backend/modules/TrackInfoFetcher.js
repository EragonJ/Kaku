define(function(require) {
  'use strict';

  var BaseModule = require('backend/modules/BaseModule');
  var youtubeDownloader = requireNode('youtube-dl');

  var TrackInfoFetcher = BaseModule(function() {
    this._options = ['--no-check-certificate', '--no-cache-dir'];
  });

  TrackInfoFetcher.prototype.getInfo = function(url) {
    var promise = new Promise((resolve, reject) => {
      youtubeDownloader.getInfo(url, this._options, (error, info) => {
        if (error) {
          this.debug(error);
          reject();
        } else {
          resolve(info);
        }
      });
    });
    return promise;
  };

  return new TrackInfoFetcher();
});
