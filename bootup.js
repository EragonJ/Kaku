var App = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

var Bootup = function() {
  this._menusTemplate = [
    {
      label: 'Kaku',
      submenu: [
        {
          label: 'About Kaku',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() {
            App.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: function() {
            BrowserWindow.getFocusedWindow().reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Command+I',
          click: function() {
            BrowserWindow.getFocusedWindow().toggleDevTools();
          }
        },
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        },
      ]
    },
    {
      label: 'Help',
      submenu: []
    }
  ];
};

Bootup.prototype = {
  init: function() {
    this._setupBrowserWindow();
  },

  _setupApplicationMenus: function() {
    var menus = Menu.buildFromTemplate(this._menusTemplate);
    Menu.setApplicationMenu(menus);
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

      // NOTE
      // this API can not because directly in init(), there might be some
      // competing problems.
      self._setupApplicationMenus();

      // Create the browser window.
      mainWindow = new BrowserWindow({
        width: 1060,
        height: 600,
        resizable: false
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
