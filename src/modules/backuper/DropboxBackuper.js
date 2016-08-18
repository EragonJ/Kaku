import Url from 'url';
import Path from 'path';

// TODO
// we need to move out BrowserWindow because this is related to UI
import Dropbox from '../wrapper/Dropbox';
const Remote = require('electron').remote;
const BrowserWindow = Remote.BrowserWindow;

class DropboxBackuper {
  constructor() {
    this._dropboxAccessToken = '';
    this._dropbox = null;
  }

  backup(datas, opitons) {
    if (!options || !datas) {
      return Promise.reject();
    }

    const folderName = options.folderName;

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
  }

  syncDataBack(options) {
    if (!options) {
      return Promise.reject();
    }

    const folderPath = options.folderPath;

    return this._isAccessTokenValid().then(() => {
      return this._readFiles(folderPath);
    }).catch(() => {
      return this._startOAuthToDropbox().then(() => {
        return this._readFiles(folderPath);
      });
    });
  }

  _isAccessTokenValid() {
    if (this._dropboxAccessToken === '' || this._dropbox === null) {
      return Promise.reject();
    }
    else {
      const promise = new Promise((resolve, reject) => {
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
  }

  _startOAuthToDropbox() {
    const promise = new Promise((resolve, reject) => {
      Dropbox.auth().then((url) => {
        let authWindow = new BrowserWindow({
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
            let parsedUrl = Url.parse(newUrl);
            let hash = parsedUrl.hash;
            let matches = hash.match(/#access_token=([^&]*)/);
            let accessToken;

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
  }

  _createFolder(folderName) {
    const promise = new Promise((resolve) => {
      this._dropbox.createDir(folderName, (error, res, body) => {
        // TODO, need to make sure if the dir does exist, what would happen ?
        // no matter how, just resolve
        resolve();
      });
    });
    return promise;
  }

  _writeFiles(datas, folderName) {
    const outterPromise = new Promise((resolve, reject) => {
      let promises = [];

      // create file
      datas.forEach((data) => {
        let content = JSON.stringify(data);
        let fileName = data.id + '.txt';
        let filePath = Path.join(folderName, fileName);
        let promise = new Promise((resolve, reject) => {
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
  }

  _readFiles(folderPath) {
    const promise = new Promise((resolve, reject) => {
      this._dropbox.getMetadata(folderPath, (error, res, body) => {
        // TODO
        // we need to know what's the error here and show needed
        // hints to users.
        if (error) {
          reject(error);
        }
        else {
          const files = body.contents;
          const promises = files.map((file) => {
            let promise = new Promise((resolve, reject) => {
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
  }

  _removeOrphantFiles(updatedFiles, folderName) {
    const promise = new Promise((resolve, reject) => {
      let folderPath = '/' + folderName;
      this._dropbox.getMetadata(folderPath, (error, res, body) => {
        let files = body.contents;
        let orphantFiles = files.filter((eachFile) => {
          // if the file is not inside the array of updatedFiles, then
          // it means the file is the orphant.
          return updatedFiles.every((eachUpdatedFile) => {
            return eachFile.path !== eachUpdatedFile.path;
          });
        });

        const promises = orphantFiles.map((file) => {
          let promise = new Promise((resolve, reject) => {
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
  }
}

module.exports = new DropboxBackuper();
