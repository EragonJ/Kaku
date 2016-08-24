import Path from 'path';
import Fs from 'fs';

class LocalBackuper {
  backup(datas, options) {
    if (!options || !datas) {
      return Promise.reject();
    }

    const basePath = options.basePath;
    const folderName = options.folderName;
    const folderPath = Path.join(basePath, folderName);

    return this._createFolder(folderPath).then(() => {
      return this._writeFiles(folderPath, datas);
    });
  }

  syncDataBack(options) {
    if (!options) {
      return Promise.reject();
    }

    const folderPath = options.folderPath;
    return this._readFiles(folderPath);
  }

  _createFolder(folderPath) {
    const promise = new Promise((resolve, reject) => {
      // check folder first
      Fs.lstat(folderPath, (error, stats) => {
        // if no such folder, then create
        if (error) {
          Fs.mkdir(folderPath, (error) => {
            // Maybe I/O is blocked, we can't do following works anymore.
            if (error) {
              reject(error);
            }
            else {
              resolve();
            }
          });
        }
        else {
          resolve();
        }
      });
    });
    return promise;
  }

  _writeFiles(folderPath, datas) {
    let promises = [];
    datas.forEach((data) => {
      let promise = new Promise((resolve, reject) => {
        let content = JSON.stringify(data);
        let fileName = data.id + '.txt';
        let filePath = Path.join(folderPath, fileName);
        Fs.writeFile(filePath, content, (error) => {
          // no matter success or not, we would still keep going.
          if (error) {
            console.log(error);
          }
          resolve();
        });
      });
      promises.push(promise);
    });
    return Promise.all(promises);
  }

  _readFiles(folderPath) {
    const promise = new Promise((resolve, reject) => {
      Fs.readdir(folderPath, (error, files) => {
        // TODO
        // need to know what the error is
        if (error) {
          reject(error);
        }
        else {
          const allowedFiles = files.filter((fileName) => {
            return fileName.match(/.txt$/);
          });

          let promises = [];
          allowedFiles.forEach((fileName) => {
            let promise = new Promise((resolve, reject) => {
              let filePath = Path.join(folderPath, fileName);
              Fs.readFile(filePath, (error, content) => {
                if (error) {
                  reject(error);
                }
                else {
                  resolve(JSON.parse(content));
                }
              });
            });
            promises.push(promise);
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
}

module.exports = new LocalBackuper();
