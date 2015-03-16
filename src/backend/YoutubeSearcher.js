define(function(require) {

  var BaseModule = require('backend/BaseModule');
  var Constants = require('backend/Constants');
  var Youtube = requireNode('youtube-node');
  var youtube = new Youtube();
  youtube.setKey(Constants.YOUTUBE_API_KEY);

  var YoutubeSearcher = BaseModule(function YoutubeSearcher() {
    // add something
  });

  YoutubeSearcher.prototype.search = function(keyword, limit) {
    var self = this;
    var promise = new Promise(function(resolve, reject) {
      youtube.search(keyword, limit, function(error, result) {
        if (error) {
          self.debug(error);
          reject();
        }
        else {
          resolve(result.items);
        }
      });
    });
    return promise;
  };

  return new YoutubeSearcher();
});
