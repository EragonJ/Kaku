import Request from 'request';

class NewsFetcher {
  constructor() {
    this._newsLink = 'https://kaku.rocks/news.json';
  }

  get() {
    const promise = new Promise((resolve, reject) => {
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
  }
}

module.exports = new NewsFetcher();
