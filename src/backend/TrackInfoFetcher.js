define(function(require) {

  var BaseModule = require('backend/BaseModule');
  var youtubeDownloader = requireNode('youtube-dl');

  var TrackInfoFetcher = BaseModule(function TrackInfoFetcher() {
    // add something
  });

  TrackInfoFetcher.prototype = {
    getInfo: function(url, options) {
      var self = this;
      var promise = new Promise(function(resolve, reject) {
        youtubeDownloader.getInfo(url, options, function(error, info) {
          if (error) {
            self.debug(error);
            reject();
          } else {
            resolve(info);
          }
        });
      });
      return promise;
    }
  };

  return new TrackInfoFetcher();
});
