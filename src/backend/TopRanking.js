define(function(require) {

  var request = requireNode('request');

  var TopRanking = function() {
    this._selectedSource = 'itunes';
    this._sources = {
      itunes: {
        url: 
          'http://itunes.apple.com/rss/topsongs/limit=100/explicit=true/json',
        json: true
      }
    };
  };

  TopRanking.prototype = {
    setSource: function(source) {
      this._selectedSource = source;
    },

    get: function() {
      var promise = new Promise(function(resolve, reject) {
        request.get(this._sources[this._selectedSource],
          function(error, response, data) {
            if (error) {
              resolve([]); 
            }
            else {
              var entries = data.feed.entry || [];
              var result = entries.map(function(entry) {
                return {
                  title: entry['im:name'].label,
                  artist: entry['im:artist'].label,
                  cover_url_medium: entry['im:image'][1].label,
                  cover_url_large: entry['im:image'][2].label
                };
              });
              resolve(result);
            }
        });
      }.bind(this));
      return promise;
    }
  };

  return new TopRanking();
});
