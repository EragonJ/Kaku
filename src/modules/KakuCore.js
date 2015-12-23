var EventEmitter = require('events').EventEmitter;
var Path = require('path');
var Remote = require('remote');
var Fs = require('fs');
var App = Remote.require('app');

var KakuCore = function() {
  EventEmitter.call(this);
  this._envInfo = null;
  this._title = '';
};

KakuCore.prototype = Object.create(EventEmitter.prototype);
KakuCore.constructor = KakuCore;

Object.defineProperty(KakuCore.prototype, 'title', {
  enumerable: true,
  configurable: true,
  set: function(title) {
    this._title = title;
    this.emit('titleUpdated', title);
  },
  get: function() {
    return this._title;
  }
});

KakuCore.prototype.isDev = function() {
  if (!this._envInfo) {
    this._envInfo = this.getEnvInfo();
  }
  return this._envInfo.env === 'development';
};

KakuCore.prototype.isProduction = function() {
  if (!this._envInfo) {
    this._envInfo = this.getEnvInfo();
  }
  return this._envInfo.env === 'production';
};

KakuCore.prototype.getEnvInfo = function() {
  var envFilePath = Path.join(App.getAppPath(), 'env.json');
  var envInfo = Fs.readFileSync(envFilePath, 'utf8');
  return JSON.parse(envInfo);
};

KakuCore.prototype.getPackageInfo = function() {
  var packageFilePath = Path.join(App.getAppPath(), 'package.json');
  var packageInfo = Fs.readFileSync(packageFilePath, 'utf8');
  return JSON.parse(packageInfo);
};

KakuCore.prototype.getInfoFromDataFolder = function(filename) {
  var filePath = Path.join(App.getAppPath(), 'data', filename);
  var fileInfo = Fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileInfo);
};

module.exports = new KakuCore();
