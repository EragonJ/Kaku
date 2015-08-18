var Constants = require('../modules/Constants');
var Dropbox = require('node-dropbox');

Dropbox.auth = function() {
  var promise = new Promise((resolve, reject) => {
    this.Authenticate(
      Constants.API.DROPBOX_API_APP_KEY,
      Constants.API.DROPBOX_API_APP_SECRET,
      'http://localhost',
      (error, url) => {
        if (error) {
          reject(error);
        }
        else {
          resolve(url);
        }
      }
    );
  });
  return promise;
};

module.exports = Dropbox;
