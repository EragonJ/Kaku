var App = require('app');
var BrowserWindow = require('browser-window');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

var Bootup = function() {

};

Bootup.prototype = {
  init: function() {
    this._setupBrowserWindow();
  },

  _setupBrowserWindow: function() {
    var self = this;

    // Quit when all windows are closed.
    App.on('window-all-closed', function() {
      if (process.platform !== 'darwin') {
        App.quit();
      }
    });

    // This method will be called when Electron has done everything
    // initialization and ready for creating browser windows.
    App.on('ready', function() {

      // Create the browser window.
      mainWindow = new BrowserWindow({
        'width': 1060,
        'height': 600,
        'min-width': 1060,
        'min-height': 600,
        'frame': false
      });

      // and load the index.html of the app.
      mainWindow.loadUrl('file://' + __dirname + '/index.html');

      // Emitted when the window is closed.
      mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
      });
    });
  }
};

var bootup = new Bootup();
bootup.init();
