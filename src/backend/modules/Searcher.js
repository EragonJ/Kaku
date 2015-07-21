define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var YoutubeSearcher = require('backend/modules/searcher/YoutubeSearcher');
  var VimeoSearcher = require('backend/modules/searcher/VimeoSearcher');
  var SoundCloudSearcher =
    require('backend/modules/searcher/SoundCloudSearcher');

  var Searcher = function() {
    EventEmitter.call(this);
    
    // default searcher
    this._selectedSearcherName = 'youtube';

    // supported searchers
    this._searchers = {
      'youtube': YoutubeSearcher,
      'vimeo': VimeoSearcher,
      'soundcloud': SoundCloudSearcher
    };

    this._searchResults = [];
  };

  Searcher.prototype = Object.create(EventEmitter.prototype);
  Searcher.constructor = Searcher;

  Object.defineProperty(Searcher.prototype, 'selectedSearcher', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._searchers[this._selectedSearcherName];
    }
  });

  Object.defineProperty(Searcher.prototype, 'searchResults', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._searchResults;
    }
  });

  Searcher.prototype.getSupportedSearchers = function() {
    var promise = new Promise((resolve, rejct) => {
      resolve(Object.keys(this._searchers));
    });
    return promise;
  };

  Searcher.prototype.search = function(keyword, limit, toSave = false) {
    if (!keyword) {
      return Promise.resolve([]);
    }
    else {
      return this.selectedSearcher.search(keyword, limit).then((results) => {
        if (toSave) {
          this._searchResults = results;
          this.emit('search-results-updated', results);
        }
        return results;
      });
    }
  };

  Searcher.prototype.changeSearcher = function(searcherName) {
    var searcher = this._searchers[searcherName];
    if (searcher) {
      this._selectedSearcherName = searcherName;
      this.emit('searcher-changed', searcherName);
    }
  };

  // singleton
  return new Searcher();
});
