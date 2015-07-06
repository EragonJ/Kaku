define(function(require) {
  'use strict';

  var request = requireNode('request');
  var BaseModule = require('backend/modules/BaseModule');
  var BaseTrack = require('backend/models/track/BaseTrack');

  var TopRanking = BaseModule(function() {
    this._selectedSource = 'itunes';
    this._sources = {
      itunes: {
        url:
          'http://itunes.apple.com/rss/topsongs/limit=100/explicit=true/json',
        json: true
      }
    };
  });

  TopRanking.prototype.setSource = function(source) {
    this._selectedSource = source;
  };

  TopRanking.prototype.get = function() {
    var promise = new Promise(function(resolve, reject) {
      request.get(this._sources[this._selectedSource],
        function(error, response, data) {
          if (error) {
            resolve([]);
          }
          else {
            var entries = data.feed.entry || [];
            var result = entries.map(function(entry) {
              var track = new BaseTrack({
                title: entry['im:name'].label,
                artist: entry['im:artist'].label,
                covers: {
                  default: entry['im:image'][1].label,
                  medium: entry['im:image'][2].label,
                  large: entry['im:image'][2].label
                }
              });
              return track;
            });
            resolve(result);
          }
      });
    }.bind(this));
    return promise;
  };

  return new TopRanking();
});
