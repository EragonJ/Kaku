var Request = require('request');

function NewsFetcher() {
  this._newsLink = 'http://kaku.rocks/news.json';
}

NewsFetcher.prototype.get = function() {
  var promise = new Promise((resolve, reject) => {
    Request.get(this._newsLink, (error, response, body) => {
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

module.exports = new NewsFetcher();
