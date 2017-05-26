// TODO
// 1. handle multiple downloads
// 2. support pause / canel downloads
// ... etc
import Fs from 'fs';
import Request from 'request';
import RequestProgress from 'request-progress';
import { EventEmitter } from 'events';

class DownloadManager extends EventEmitter {
  constructor() {
    super();

    this._cssAnimationTime = 1000;
    this._downloads = [];
  }

  download(src, path) {
    const req = RequestProgress(Request.get(src), {
      delay: 1000 // start to emit after 1000ms delay
    });

    req.on('progress', (state) => {
      this.emit('download-progress', Math.floor(state.percentage * 100));
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

      this.emit('download-progress', 100);

      setTimeout(() => {
        this.emit('download-finish');
      }, this._cssAnimationTime);
    });

    this._downloads.push(req);
    return req;
  }
}

module.exports = new DownloadManager();
