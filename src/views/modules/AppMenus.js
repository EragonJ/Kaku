var remote = require('remote');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');
var BrowserWindow = remote.require('browser-window');
var App = remote.require('app');

var Player = require('./Player');

function AppMenus() {
  // TODO
  // add tranlation later
}

AppMenus.prototype = {
  build: function() {
    var templates = this._getMenusTemplateForCurrentPlatform();
    var menus = Menu.buildFromTemplate(templates);
    Menu.setApplicationMenu(menus);
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

  _getMenuTemplateForControl: function() {
    return {
      label: 'Control',
      submenu: [
        {
          label: 'Play Previous Track',
          accelerator: 'CmdOrCtrl+Left',
          click: function() {
            Player.playPreviousTrack();
          }
        },
        {
          label: 'Play / Pause',
          accelerator: 'CmdOrCtrl+P',
          click: function() {
            Player.playOrPause();
          }
        },
        {
          label: 'Play Next Track',
          accelerator: 'CmdOrCtrl+Right',
          click: function() {
            Player.playNextTrack();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Increase Volume',
          accelerator: 'CmdOrCtrl+Up',
          click: function() {
            Player.setVolume('up');
          }
        },
        {
          label: 'Decrease Volume',
          accelerator: 'CmdOrCtrl+Down',
          click: function() {
            Player.setVolume('down');
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Download Track',
          accelerator: 'CmdOrCtrl+D',
          click: function() {
            Player.downloadCurrentTrack();
          }
        }
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
        templates.push(this._getMenuTemplateForControl());
        templates.push(this._getMenuTemplateForWindow());
        break;

      default:
        templates.push(this._getMenuTemplateForView());
        templates.push(this._getMenuTemplateForControl());
        break;
    }

    return templates;
  }
};

module.exports = new AppMenus();
