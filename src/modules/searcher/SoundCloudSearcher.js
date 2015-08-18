var SoundCloud = require('node-soundcloud');
var SoundCloudTrack = require('../../models/track/SoundCloudTrack');
var Constants = require('../../modules/Constants');
var Tracker = require('../../modules/Tracker');

function SoundCloudSearcher() {
  this._init();
}

SoundCloudSearcher.prototype._init = function() {
  SoundCloud.init({
    id: Constants.API.SOUND_CLOUD_API_CLIENT_ID,
    secret: Constants.API.SOUND_CLOUD_API_CLIENT_SECRET,
    uri: ''
  });
};

SoundCloudSearcher.prototype.search = function(keyword, limit) {
  limit = limit || 200;

  var promise = new Promise((resolve, reject) => {
    SoundCloud.get('/tracks', {
      limit: limit,
      q: keyword
    }, (error, rawTracks) => {
      if (error) {
        reject(error);
      }
      else {
        var soundCloudTracks = rawTracks.map((rawTrack) => {
          var track = new SoundCloudTrack();
          track.init(rawTrack);
          return track;
        });
        Tracker.event('SoundCloudSearcher', 'search', keyword).send();
        resolve(soundCloudTracks);
      }
    });
  });

  return promise;
};

module.exports = new SoundCloudSearcher();
