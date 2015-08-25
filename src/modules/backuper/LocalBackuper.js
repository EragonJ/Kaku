var Path = require('path');
var Fs = require('fs');

var LocalBackuper = function() {

};

LocalBackuper.prototype.backup = function(datas, options) {
  if (!options || !datas) {
    return Promise.reject(); 
  }

  var basePath = options.basePath;
  var folderName = options.folderName;
  var folderPath = Path.join(basePath, folderName); 

  return this._createFolder(folderPath).then(() => {
    return this._writeFiles(folderPath, datas);
  });
};

LocalBackuper.prototype.syncDataBack = function(options) {
  if (!options) {
    return Promise.reject();
  }

  var folderPath = options.folderPath;
  return this._readFiles(folderPath);
};

LocalBackuper.prototype._createFolder = function(folderPath) {
  var promise = new Promise((resolve, reject) => {
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
};

LocalBackuper.prototype._writeFiles = function(folderPath, datas) {
  var promises = [];
  datas.forEach((data) => {
    var promise = new Promise((resolve, reject) => {
      var content = JSON.stringify(data);
      var fileName = data.id + '.txt';
      var filePath = Path.join(folderPath, fileName);
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
};

LocalBackuper.prototype._readFiles = function(folderPath) {
  var promise = new Promise((resolve, reject) => {
    Fs.readdir(folderPath, (error, files) => {
      // TODO
      // need to know what the error is 
      if (error) {
        reject(error);
      }
      else {
        var allowedFiles = files.filter((fileName) => {
          return fileName.match(/.txt$/);
        });

        var promises = [];
        allowedFiles.forEach((fileName) => {
          var promise = new Promise((resolve, reject) => {
            var filePath = Path.join(folderPath, fileName);
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
};

module.exports = new LocalBackuper();
