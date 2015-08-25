var YoutubeDownloader = require('youtube-dl');
var BaseModule = require('../modules/BaseModule');

var TrackInfoFetcher = BaseModule(function() {
  this._options = ['--no-check-certificate', '--no-cache-dir'];
});

TrackInfoFetcher.prototype.getInfo = function(url) {
  var promise = new Promise((resolve, reject) => {
    YoutubeDownloader.getInfo(url, this._options, (error, info) => {
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

module.exports = new TrackInfoFetcher();
