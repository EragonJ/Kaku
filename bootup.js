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
};

Bootup.prototype = {
  init: function() {
    this._setupBrowserWindow();
  },

  _getMenuTemplateForAbout: function() {
    return {
      label: 'Kaku',
      submenu: [
        {
          label: 'About Kaku',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide Kaku',
          accelerator: 'CmdOrCtrl+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'CmdOrCtrl+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: function() {
            App.quit();
          }
        }
      ]
    };
  },

  _getMenuTemplateForEdit: function() {
    return {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        },
      ]
    };
  },

  _getMenuTemplateForView: function() {
    return {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function() {
            BrowserWindow.getFocusedWindow().reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: function() {
            BrowserWindow.getFocusedWindow().toggleDevTools();
          }
        },
      ]
    };
  },

  _getMenuTemplateForWindow: function() {
    return {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
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
    };
  },

  _getMenusTemplateForCurrentPlatform: function() {
    var templates = [];
    var platform = process.platform;

    switch (platform) {
      case 'darwin':
        templates.push(this._getMenuTemplateForAbout());
        templates.push(this._getMenuTemplateForEdit());
        templates.push(this._getMenuTemplateForView());
        templates.push(this._getMenuTemplateForWindow());
        break;

      default:
        templates.push(this._getMenuTemplateForView());
        break;
    }

    return templates;
  },

  _setupApplicationMenus: function() {
    var templates = this._getMenusTemplateForCurrentPlatform();
    var menus = Menu.buildFromTemplate(templates);
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
