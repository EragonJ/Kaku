define(function(require) {

  var BaseModule = require('backend/BaseModule');
  var youtubeDownloader = requireNode('youtube-dl');

  var TrackInfoFetcher = BaseModule(function() {
    // add something
  });

  TrackInfoFetcher.prototype.getInfo = function(url, options) {
    var promise = new Promise((resolve, reject) => {
      youtubeDownloader.getInfo(url, options, (error, info) => {
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
