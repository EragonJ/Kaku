define(function(require) {
  'use strict';
  
  var Url = requireNode('url');
  var path = requireNode('path');

  // TODO
  // we need to move out BrowserWindow because this is related to UI
  var remote = requireNode('remote');
  var BrowserWindow = remote.require('browser-window');
  var Dropbox = require('backend/modules/Dropbox');

  var DropboxBackuper = function() {
    this._dropboxAccessToken = '';
    this._dropbox = null;
  };

  DropboxBackuper.prototype.backup = function(datas, options) {
    if (!options || !datas) {
      return Promise.reject();
    }

    var folderName = options.folderName;

    // TODO
    // we may need to handle expriation problems
    if (this._dropboxAccessToken) {
      return this._createFolder(folderName).then(() => {
        this._writeFiles(datas, folderName);
      });
    }
    else {
      return this._startOAuthToDropbox().then(() => {
        return this._createFolder(folderName).then(() => {
          return this._writeFiles(datas, folderName);
        });
      });
    }
  };

  DropboxBackuper.prototype.syncDataBack = function(options) {
    if (!options) {
      return Promise.reject();
    }

    var folderPath = options.folderPath;

    // TODO
    // we may need to handle expriation problems
    if (this._dropboxAccessToken) {
      return this._readFiles(folderPath);
    }
    else {
      return this._startOAuthToDropbox().then(() => {
        return this._readFiles(folderPath);
      });
    }
  };

  DropboxBackuper.prototype._startOAuthToDropbox = function() {
    var promise = new Promise((resolve, reject) => {
      Dropbox.auth().then((url) => {
        var authWindow = new BrowserWindow({
          width: 800,
          height: 600,
          'node-integration': false
        });
        authWindow.loadUrl(url);
        authWindow.show();
        authWindow.on('close', () => {
          authWindow = null;
        }, false);
        authWindow.webContents.on('did-get-redirect-request',
          (event, oldUrl, newUrl) => {
            var parsedUrl = Url.parse(newUrl);
            var hash = parsedUrl.hash;
            var matches = hash.match(/#access_token=([^&]*)/);
            var accessToken;

            // close the window
            authWindow.close();

            if (matches && matches.length > 0) {
              this._dropboxAccessToken = matches[1];
              this._dropbox = Dropbox.api(this._dropboxAccessToken);
              resolve();
            }
            else {
              reject('can\'t get the right access token');
            }
        });
      });
    });
    return promise;
  };

  DropboxBackuper.prototype._createFolder = function(folderName) {
    var promise = new Promise((resolve) => {
      this._dropbox.createDir(folderName, (error, res, body) => {
        // TODO, need to make sure if the dir does exist, what would happen ?
        // no matter how, just resolve
        resolve();
      });
    });
    return promise;
  };

  DropboxBackuper.prototype._writeFiles = function(datas, folderName) {
    var outterPromise = new Promise((resolve, reject) => {
      var promises = [];

      // create file
      datas.forEach((data) => {
        var content = JSON.stringify(data);
        var fileName = data.id + '.txt';
        var filePath = path.join(folderName, fileName);
        var promise = new Promise((resolve, reject) => {
          this._dropbox.createFile(filePath, content, (error) => {
            // no matter success or not, we would still keep going.
            if (error) {
              console.log(error);
            }
            resolve();
          });
        });
        promises.push(promise);
      });

      Promise.all(promises).then(() => {
        resolve();
      }).catch(() => {
        reject();
      });
    });

    return outterPromise;
  };

  DropboxBackuper.prototype._readFiles = function(folderPath) {
    var promise = new Promise((resolve, reject) => {
      this._dropbox.getMetadata(folderPath, (error, res, metaBody) => {
        // TODO
        // we need to know what's the error here and show needed 
        // hints to users.
        if (error) {
          reject(error);
        }
        else {
          var files = metaBody.contents;
          var promises = files.map((file) => {
            var promise = new Promise((resolve, reject) => {
              this._dropbox.getFile(file.path, (error, res, fileBody) => {
                if (!error) {
                  resolve(fileBody);
                }
                else {
                  // TODO
                  // know what's going on here
                  reject(error);
                }
              });
            });
            return promise;
          });

          Promise.all(promises).then((contents) => {
            resolve(contents);
          }).catch((error) => {
            reject(error);
          });
        }
      });
    });
    return promise;
  };

  return new DropboxBackuper();
});
