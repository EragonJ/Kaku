var Request = require('request');
var ItunesRSSData = require('node-itunes-rss-data');
var BaseTrack = require('../models/track/BaseTrack');
var EventEmitter = require('events').EventEmitter;

var TopRanking = function() {
  EventEmitter.call(this);

  // Right now, there is only one source
  this._selectedSource = 'itunes';
  this._selectedCountry = 'us';
  this._sources = {
    itunes: {
      url:
        'https://itunes.apple.com/__country__/rss/topsongs/' +
        'limit=100/explicit=true/json'
    }
  };
};

TopRanking.prototype = Object.create(EventEmitter.prototype);
TopRanking.constructor = TopRanking;

TopRanking.prototype._getSourceURL = function() {
  var rawURL = this._sources[this._selectedSource].url;
  return rawURL.replace('__country__', this._selectedCountry);
};

TopRanking.prototype.getCountryList = function() {
  /*
   * {
      "ae": "United Arab Emirates",
      "ag": "Antigua and Barbuda",
      "ai": "Anguilla",
      "al": "Albania",
      ...
     }
   */
  return ItunesRSSData.countries;
};

TopRanking.prototype.changeCountry = function(countryCode) {
  if (countryCode in ItunesRSSData.countries) {
    this._selectedCountry = countryCode;
    this.emit('topRanking-changed', countryCode);
  }
};

TopRanking.prototype.get = function() {
  var promise = new Promise((resolve, reject) => {
    Request.get({
      url: this._getSourceURL(),
      json: true
    }, function(error, response, data) {
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
  });
  return promise;
};

module.exports = new TopRanking();
