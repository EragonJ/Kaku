var Remote = require('remote');
var App = Remote.require('app');
var Menu = Remote.require('menu');
var MenuItem = Remote.require('menu-item');
var BrowserWindow = Remote.require('browser-window');

var Player = require('./Player');
var L10nManager = require('../../modules/L10nManager');
var _ = L10nManager.get.bind(L10nManager);

function AppMenus() {
  L10nManager.on('language-changed', () => {
    this.build();
  });
}

AppMenus.prototype = {
  build: function() {
    var templates = this._getMenusTemplateForCurrentPlatform();
    var menus = Menu.buildFromTemplate(templates);
    Menu.setApplicationMenu(menus);
  },

  _getMenuTemplateForAbout: function() {
    return {
      label: _('app_menu_kaku'),
      submenu: [
        {
          label: _('app_menu_about_kaku'),
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_sevices'),
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_hide_kaku'),
          accelerator: 'CmdOrCtrl+H',
          selector: 'hide:'
        },
        {
          label: _('app_menu_hide_others'),
          accelerator: 'CmdOrCtrl+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: _('app_menu_show_all'),
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_quit'),
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
      label: _('app_menu_edit'),
      submenu: [
        {
          label: _('app_menu_undo'),
          accelerator: 'CmdOrCtrl+Z',
          selector: 'undo:'
        },
        {
          label: _('app_menu_redo'),
          accelerator: 'Shift+CmdOrCtrl+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_cut'),
          accelerator: 'CmdOrCtrl+X',
          selector: 'cut:'
        },
        {
          label: _('app_menu_copy'),
          accelerator: 'CmdOrCtrl+C',
          selector: 'copy:'
        },
        {
          label: _('app_menu_paste'),
          accelerator: 'CmdOrCtrl+V',
          selector: 'paste:'
        },
        {
          label: _('app_menu_select_all'),
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        },
      ]
    };
  },

  _getMenuTemplateForView: function() {
    return {
      label: _('app_menu_view'),
      submenu: [
        {
          label: _('app_menu_search_track'),
          accelerator: 'CmdOrCtrl+F',
          click: function() {
            // TODO
            // need to move this out to its own module
            document.querySelector('.searchbar-user-input').focus();
          }
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_reload'),
          accelerator: 'CmdOrCtrl+R',
          click: function() {
            BrowserWindow.getFocusedWindow().reloadIgnoringCache();
          }
        },
        {
          label: _('app_menu_toggle_devtools'),
          accelerator: 'Alt+CmdOrCtrl+I',
          click: function() {
            BrowserWindow.getFocusedWindow().toggleDevTools();
          }
        }
      ]
    };
  },

  _getMenuTemplateForControl: function() {
    return {
      label: _('app_menu_control'),
      submenu: [
        {
          label: _('app_menu_play_previous_track'),
          accelerator: 'CmdOrCtrl+Left',
          click: function() {
            Player.playPreviousTrack();
          }
        },
        {
          label: _('app_menu_play_or_pause_track'),
          accelerator: 'CmdOrCtrl+P',
          click: function() {
            Player.playOrPause();
          }
        },
        {
          label: _('app_menu_play_next_track'),
          accelerator: 'CmdOrCtrl+Right',
          click: function() {
            Player.playNextTrack();
          }
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_increase_volume'),
          accelerator: 'CmdOrCtrl+Up',
          click: function() {
            Player.setVolume('up');
          }
        },
        {
          label: _('app_menu_decrease_volume'),
          accelerator: 'CmdOrCtrl+Down',
          click: function() {
            Player.setVolume('down');
          }
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_download_track'),
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
      label: _('app_menu_window'),
      submenu: [
        {
          label: _('app_menu_minimize'),
          accelerator: 'CmdOrCtrl+M',
          selector: 'performMiniaturize:'
        },
        {
          label: _('app_menu_close'),
          accelerator: 'CmdOrCtrl+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_bring_all_to_front'),
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
