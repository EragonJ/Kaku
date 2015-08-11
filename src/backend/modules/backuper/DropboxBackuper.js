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

    return this._isAccessTokenValid().then(() => {
      return this._createFolder(folderName).then(() => {
        return this._writeFiles(datas, folderName).then((updatedFiles) => {
          return this._removeOrphantFiles(updatedFiles, folderName);
        });
      });
    }).catch(() => {
      return this._startOAuthToDropbox().then(() => {
        return this._createFolder(folderName).then(() => {
          return this._writeFiles(datas, folderName).then((updatedFiles) => {
            return this._removeOrphantFiles(updatedFiles, folderName);
          });
        });
      });
    });
  };

  DropboxBackuper.prototype.syncDataBack = function(options) {
    if (!options) {
      return Promise.reject();
    }

    var folderPath = options.folderPath;

    return this._isAccessTokenValid().then(() => {
      return this._readFiles(folderPath);
    }).catch(() => {
      return this._startOAuthToDropbox().then(() => {
        return this._readFiles(folderPath);
      });
    });
  };

  DropboxBackuper.prototype._isAccessTokenValid = function() {
    if (this._dropboxAccessToken === '' || this._dropbox === null) {
      return Promise.reject();
    }
    else {
      var promise = new Promise((resolve, reject) => {
        this._dropbox.account((error, res, body) => {
          // TODO
          // error is always null because it uses Request ...
          if (body.error) {
            console.log(body.error);
            reject();
          }
          else {
            // If we can successfully get users' data, it means our token
            // is still valid
            resolve();
          }
        });
      });
      return promise;
    }
  };

  DropboxBackuper.prototype._startOAuthToDropbox = function() {
    var promise = new Promise((resolve, reject) => {
      Dropbox.auth().then((url) => {
        var authWindow = new BrowserWindow({
          width: 800,
          height: 600,
          title: 'Kaku',
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
          this._dropbox.createFile(filePath, content, (error, res, body) => {
            // no matter success or not, we would still keep going.
            if (error) {
              console.log(error);
            }

            // TODO
            // this is a bug in node_dropbox, need to give it a fix
            resolve(JSON.parse(body));
          });
        });
        promises.push(promise);
      });

      Promise.all(promises).then((updatedFiles) => {
        resolve(updatedFiles);
      }).catch(() => {
        reject();
      });
    });

    return outterPromise;
  };

  DropboxBackuper.prototype._readFiles = function(folderPath) {
    var promise = new Promise((resolve, reject) => {
      this._dropbox.getMetadata(folderPath, (error, res, body) => {
        // TODO
        // we need to know what's the error here and show needed
        // hints to users.
        if (error) {
          reject(error);
        }
        else {
          var files = body.contents;
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

  DropboxBackuper.prototype._removeOrphantFiles =
    function(updatedFiles, folderName) {
      var promise = new Promise((resolve, reject) => {
        var folderPath = '/' + folderName;
        this._dropbox.getMetadata(folderPath, (error, res, body) => {
          var files = body.contents;
          var orphantFiles = files.filter((eachFile) => {
            // if the file is not inside the array of updatedFiles, then
            // it means the file is the orphant.
            return updatedFiles.every((eachUpdatedFile) => {
              return eachFile.path !== eachUpdatedFile.path;
            });
          });

          var promises = orphantFiles.map((file) => {
            var promise = new Promise((resolve, reject) => {
              this._dropbox.removeFile(file.path, (error, res, fileBody) => {
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

          Promise.all(promises).then(() => {
            resolve();
          }).catch((error) => {
            reject(error);
          });
        });
      });
      return promise;
  };

  return new DropboxBackuper();
});
