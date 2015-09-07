let EventEmitter = require('events').EventEmitter;
let YoutubeDownloader = require('youtube-dl');
let BaseModule = require('../modules/BaseModule');

let TrackInfoFetcher = function() {
  EventEmitter.call(this);

  this._userOptions = {};
  this._defaultOptions = [
    '--no-check-certificate',
    '--no-cache-dir',
  ];
  this._supportedTrackFormats = [
    {
      l10nId: 'settings_option_best_video_format',
      value: 'bestvideo'
    },
    {
      l10nId: 'settings_option_best_audio_format',
      value: 'bestaudio'
    }
  ];
};

TrackInfoFetcher.prototype = Object.create(EventEmitter.prototype);
TrackInfoFetcher.constructor = TrackInfoFetcher;

/**
 * setOptions({
 *   '-f': 'bestaudio'
 *   '--no-cache-dir': ''
 * })
 */
TrackInfoFetcher.prototype.setOptions = function(options) {
  for (let key in options) {
    this._userOptions[key] = options[key];
  }
};

TrackInfoFetcher.prototype.changeFormat = function(format) {
  this.setOptions({
    '-f': format
  });
  this.emit('format-changed', format);
};

TrackInfoFetcher.prototype.getOptions = function() {
  let options = this._defaultOptions;

  for (let key in this._userOptions) {
    // we can't override default options
    if (options.indexOf(key) !== -1) {
      continue;
    }
    else {
      // [ '-f bestaudio', '--no-cache-dir  ', ... ]
      let option = key + ' ' + this._userOptions[key];
      options.push(option);
    }
  }

  return options;
};

TrackInfoFetcher.prototype.getSupportedFormats = function() {
  return this._supportedTrackFormats;
};

TrackInfoFetcher.prototype.getInfo = function(url) {
  let promise = new Promise((resolve, reject) => {
    YoutubeDownloader.getInfo(url, this.getOptions(), (error, info) => {
      if (error) {
        console.log(error);
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
  return promise;
};

module.exports = new TrackInfoFetcher();
