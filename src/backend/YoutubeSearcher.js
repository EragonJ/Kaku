define(function(require) {
  'use strict';

  var BaseModule = require('backend/BaseModule');
  var Constants = require('backend/Constants');
  var YoutubeTrack = require('backend/models/track/YoutubeTrack');
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
          var tracks = [];
          result.items.forEach(function(rawTrack) {
            // NOTE
            // there are results mixing with youtube#channel so we have to
            // ignore them
            if (rawTrack.id && rawTrack.id.kind === 'youtube#video') {
              tracks.push(YoutubeTrack(rawTrack));
            }
          });
          resolve(tracks);
        }
      });
    });
    return promise;
  };

  return new YoutubeSearcher();
});
