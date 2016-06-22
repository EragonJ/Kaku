var Fs = require('fs');
var Path = require('path');
var Electron = require('electron');
var Remote = Electron.remote;
var App = Remote.app;
var EventEmitter = require('events').EventEmitter;

var AppCore = function() {
  EventEmitter.call(this);
  this._envInfo = null;
  this._title = '';
};

AppCore.prototype = Object.create(EventEmitter.prototype);
AppCore.constructor = AppCore;

Object.defineProperty(AppCore.prototype, 'title', {
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

AppCore.prototype.isDev = function() {
  if (!this._envInfo) {
    this._envInfo = this.getEnvInfo();
  }
  return this._envInfo.env === 'development';
};

AppCore.prototype.isProduction = function() {
  if (!this._envInfo) {
    this._envInfo = this.getEnvInfo();
  }
  return this._envInfo.env === 'production';
};

AppCore.prototype.getEnvInfo = function() {
  var envFilePath = Path.join(App.getAppPath(), 'env.json');
  var envInfo = Fs.readFileSync(envFilePath, 'utf8');
  return JSON.parse(envInfo);
};

AppCore.prototype.getPackageInfo = function() {
  var packageFilePath = Path.join(App.getAppPath(), 'package.json');
  var packageInfo = Fs.readFileSync(packageFilePath, 'utf8');
  return JSON.parse(packageInfo);
};

AppCore.prototype.getInfoFromDataFolder = function(filename) {
  var filePath = Path.join(App.getAppPath(), 'data', filename);
  var fileInfo = Fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileInfo);
};

module.exports = new AppCore();
