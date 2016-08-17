// TODO
// 1. handle multiple downloads
// 2. support pause / canel downloads
// ... etc
const Fs = require('fs');
const Request = require('request');
const RequestProgress = require('request-progress');
const { EventEmitter } = require('events');

class DownloadManager extends EventEmitter {
  constructor() {
    super();
    this._downloads = [];
  }

  download(src, path) {
    const req = RequestProgress(Request.get(src), {
      delay: 1000 // start to emit after 1000ms delay
    });

    req.on('progress', (state) => {
      this.emit('download-progress', state.percent);
    })
    .on('error', (error) => {
      console.log('error when requesting file');
      console.log(error);
      this.emit('download-error');
    })
    .pipe(Fs.createWriteStream(path))
    .on('error', (error) => {
      console.log('error when saving file to path' + path);
      console.log(error);
      this.emit('download-error');
    })
    .on('close', () => {
      const index = this._downloads.indexOf(req);
      if (index >= 0) {
        this._downloads.splice(index, 1);
      }
      this.emit('download-finish');
    });

    this._downloads.push(req);
    return req;
  }
}

module.exports = new DownloadManager();
