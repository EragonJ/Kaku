define(function(require) {
  'use strict';

  var Constants = require('backend/Constants');
  var YoutubeTrack = require('backend/models/track/YoutubeTrack');
  var Youtube = requireNode('youtube-node');

  var YoutubeSearcher = function() {
    this._youtube = new Youtube();
    this._youtube.setKey(Constants.API.YOUTUBE_API_KEY);
  };

  YoutubeSearcher.prototype.search = function(keyword, limit) {
    var promise = new Promise((resolve, reject) => {
      this._youtube.search(keyword, limit, (error, result) => {
        if (error) {
          console.error(error.error.message);
          reject();
        }
        else {
          var tracks = [];
          result.items.forEach((rawTrack) => {
            // NOTE
            // there are results mixing with youtube#channel so we have to
            // ignore them
            if (rawTrack.id && rawTrack.id.kind === 'youtube#video') {
              var youtubeTrack = new YoutubeTrack();
              youtubeTrack.initYoutubeResult(rawTrack);
              tracks.push(youtubeTrack);
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
