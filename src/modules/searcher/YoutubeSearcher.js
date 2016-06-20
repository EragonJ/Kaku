var Youtube = require('../wrapper/Youtube');
var YoutubeTrack = require('kaku-core/models/track/YoutubeTrack');
var Tracker = require('../../modules/Tracker');

var YoutubeSearcher = function() {

};

YoutubeSearcher.prototype.search = function(keyword, limit) {
  var promise = new Promise((resolve, reject) => {
    Youtube.search(keyword, limit, function(error, result) {
      if (error) {
        console.error(error);
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
        Tracker.event('YoutubeSearcher', 'search', keyword).send();
        resolve(tracks);
      }
    });
  });
  return promise;
};

module.exports = new YoutubeSearcher();
