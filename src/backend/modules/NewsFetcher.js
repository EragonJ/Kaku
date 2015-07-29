define(function(require) {
  'use strict';

  var request = requireNode('request');
  var NewsFetcher = function() {
    this._newsLink = 'http://kaku.rocks/news.json';
  };

  NewsFetcher.prototype.get = function() {
    var promise = new Promise((resolve, reject) => {
      request.get(this._newsLink, (error, response, body) => {
        if (error) {
          reject(error);
          console.log(error);
        }
        else {
          var result = JSON.parse(body);
          resolve(result.news);
        }
      });
    });
    return promise;
  };

  return new NewsFetcher();
});
