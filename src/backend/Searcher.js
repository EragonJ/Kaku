define(function(require) {
  'use strict';

  // TODO
  // move all searchers into its sub-folder

  var YoutubeSearcher = require('backend/YoutubeSearcher');
  var EventEmitter = requireNode('events').EventEmitter;

  var Searcher = function() {
    EventEmitter.call(this);
    
    // TODO
    // we can change _searcher based on user's setting in the future
    this._searcher = YoutubeSearcher;
    this._searchResults = [];
  };

  Searcher.prototype = Object.create(EventEmitter.prototype);
  Searcher.constructor = Searcher;

  Object.defineProperty(Searcher, 'searchResults', {
    enumerable: true,
    configurable: false,
    get: function() {
      return this._searchResults;
    }
  });

  Searcher.prototype.search = function(keyword, limit, toSave = false) {
    return this._searcher.search(keyword, limit).then((results) => {
      if (toSave) {
        this._searchResults = results;
        this.emit('search-results-updated', results);
      }
      return results;
    });
  };

  // singleton
  return new Searcher();
});
