define(function(require) {
  'use strict';

  // TODO
  // 1. handle multiple downloads
  // 2. support pause / canel downloads
  // ... etc

  var fs = requireNode('fs');
  var request = requireNode('request');
  var requestProgress = requireNode('request-progress');
  var EventEmitter = requireNode('events').EventEmitter;

  var DownloadManager = function() {
    EventEmitter.call(this);

    this._downloads = [];
  };

  DownloadManager.prototype = Object.create(EventEmitter.prototype);
  DownloadManager.constructor = DownloadManager;

  DownloadManager.prototype.download = function(src, path) {
    var req = requestProgress(request.get(src), {
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
    .pipe(fs.createWriteStream(path))
    .on('error', (error) => {
      console.log('error when saving file to path' + path);
      console.log(error);
      this.emit('download-error');
    })
    .on('close', () => {
      var index = this._downloads.indexOf(req);
      if (index >= 0) {
        this._downloads.splice(index, 1);
      }
      this.emit('download-finish');
    });
     
    this._downloads.push(req);
    return req;
  };

  return new DownloadManager();
});
