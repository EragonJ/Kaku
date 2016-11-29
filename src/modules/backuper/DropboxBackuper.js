// TODO
// we need to move out BrowserWindow because this is related to UI
import Dropbox from 'dropbox';
import Url from 'url';
import Path from 'path';
import Constants from '../Constants';

const Remote = require('electron').remote;
const BrowserWindow = Remote.BrowserWindow;

class DropboxBackuper {
  constructor() {
    this._dropboxAccessToken = '';
    this._dropbox = new Dropbox({
      clientId: Constants.API.DROPBOX_API_APP_KEY
    });
  }

  backup(datas, options) {
    if (!options || !datas) {
      return Promise.reject();
    }

    let folderPath = options.folderPath;

    return this._isAccessTokenValid().then(() => {
      return this._removeFolder(folderPath).then(() => {
        return this._createFolder(folderPath).then(() => {
          return this._writeFiles(folderPath, datas);
        });
      });
    }).catch(() => {
      return this._startOAuthToDropbox().then(() => {
        return this._removeFolder(folderPath).then(() => {
          return this._createFolder(folderPath).then(() => {
            return this._writeFiles(folderPath, datas);
          });
        });
      });
    });
  }

  syncDataBack(options) {
    if (!options) {
      return Promise.reject();
    }

    let folderPath = options.folderPath;

    return this._isAccessTokenValid().then(() => {
      return this._readFiles(folderPath);
    }).catch(() => {
      return this._startOAuthToDropbox().then(() => {
        return this._readFiles(folderPath);
      });
    });
  }

  _isAccessTokenValid() {
    if (this._dropboxAccessToken === '') {
      return Promise.reject();
    }
    else {
      // By reading user's information, we can know whether the token is still
      // valid or not based on returned result.
      return this._dropbox.usersGetCurrentAccount();
    }
  }

  _startOAuthToDropbox() {
    return new Promise((resolve, reject) => {
      let url = this._dropbox.getAuthenticationUrl('http://localhost');
      let authWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Kaku',
        'node-integration': false
      });
      authWindow.loadURL(url);
      authWindow.show();
      authWindow.on('close', () => {
        authWindow = null;
      }, false);
      authWindow.webContents.on('did-get-redirect-request',
        (event, oldUrl, newUrl) => {
          let parsedUrl = Url.parse(newUrl);
          let hash = parsedUrl.hash;
          let matches = hash.match(/#access_token=([^&]*)/);

          // close the window
          authWindow.close();

          if (matches && matches.length > 0) {
            let token = matches[1];
            this._dropboxAccessToken = token;
            this._dropbox.setAccessToken(token);
            resolve();
          }
          else {
            reject('can\'t get the right access token');
          }
      });
    });
  }

  _createFolder(folderPath) {
    return new Promise((resolve) => {
      this._dropbox.filesCreateFolder({
        path: folderPath
      }).then(() => {
        resolve();
      }).catch(() => {
        // may because the folder does exist there, just ignore
        resolve();
      });
    });
  }

  _removeFolder(folderPath) {
    return new Promise((resolve) => {
      this._dropbox.filesDelete({
        path: folderPath
      }).then(() => {
        resolve();
      }).catch(() => {
        resolve();
      });
    });
  }

  _writeFiles(folderPath, datas) {
    return new Promise((resolve, reject) => {
      let promises = [];

      // create file
      datas.forEach((data) => {
        let contents = JSON.stringify(data);
        let fileName = data.id + '.txt';
        let filePath = Path.join(folderPath, fileName);
        let promise = new Promise((resolve, reject) => {
          this._dropbox.filesUpload({
            path: filePath,
            contents: contents
          }).then((result) => {
            resolve(result);
          }).catch((error) => {
            if (error) {
              console.log(error);
            }
            resolve({});
          });
        });
        promises.push(promise);
      });

      Promise.all(promises).then((updatedFiles) => {
        resolve(updatedFiles);
      });
    });
  }

  _readFiles(folderPath) {
    return new Promise((resolve, reject) => {
      this._dropbox.filesListFolder({
        path: folderPath
      }).then((result) => {
        // only need file format
        let files = result.entries.filter((file) => {
          return file['.tag'] === 'file';
        });

        // keep only real content
        let promises = files.map((file) => {
          return new Promise((resolve, reject) => {
            this._dropbox.filesDownload({
              path: file.path_display
            }).then((result) => {
              // TODO check dropbox repo to see whether this got fixed
              resolve(JSON.parse(result.fileBinary));
            }).catch((error) => {
              reject(error);
            });
          });
        });

        // then pass back
        Promise.all(promises).then((contents) => {
          resolve(contents);
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    });
  }

  _removeOrphantFiles(folderPath, updatedFiles) {
    return new Promise((resolve, reject) => {
      this._dropbox.filesListFolder({
        path: folderPath
      }).then((result) => {
        // only need file format
        let files = result.entries.filter((file) => {
          return file['.tag'] === 'file';
        });

        let orphantFiles = files.filter((eachFile) => {
          // if the file is not inside the array of updatedFiles, then
          // it means the file is the orphant.
          return updatedFiles.every((eachUpdatedFile) => {
            return eachFile.path_display !== eachUpdatedFile.path_display;
          });
        });

        let promises = orphantFiles.map((file) => {
          return this._dropbox.filesDelete({
            path: file.path
          });
        });

        Promise.all(promises).then(() => {
          resolve();
        }).catch((error) => {
          reject(error);
        });
      });
    });
  }
}

module.exports = new DropboxBackuper();
