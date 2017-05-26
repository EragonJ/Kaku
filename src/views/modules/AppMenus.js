import Electron from 'electron';
import Notifier from './Notifier';
import Player from './Player';
import L10nManager from '../../modules/L10nManager';
import DownloadManager from '../../modules/DownloadManager';

const Remote = Electron.remote;
const App = Remote.app;
const Menu = Remote.Menu;
const Dialog = Remote.dialog;
const MenuItem = Remote.MenuItem;
const BrowserWindow = Remote.BrowserWindow;

const _ = L10nManager.get.bind(L10nManager);

class AppMenus {
  constructor() {
    L10nManager.on('language-changed', () => {
      this.build();
    });
  }

  build() {
    let templates = this._getMenusTemplateForCurrentPlatform();
    let menus = Menu.buildFromTemplate(templates);
    Menu.setApplicationMenu(menus);
  }

  _getMenuTemplateForAbout() {
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
          click() {
            App.quit();
          }
        }
      ]
    };
  }

  _getMenuTemplateForEdit() {
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
  }

  _getMenuTemplateForView() {
    return {
      label: _('app_menu_view'),
      submenu: [
        {
          label: _('app_menu_search_track'),
          accelerator: 'CmdOrCtrl+F',
          click() {
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
          click() {
            let win = BrowserWindow.getFocusedWindow();
            if (win) {
              win.webContents.reloadIgnoringCache();
            }
          }
        },
        {
          label: _('app_menu_toggle_devtools'),
          accelerator: 'Alt+CmdOrCtrl+I',
          click() {
            let win = BrowserWindow.getFocusedWindow();
            if (win) {
              win.webContents.toggleDevTools();
            }
          }
        }
      ]
    };
  }

  _getMenuTemplateForControl() {
    return {
      label: _('app_menu_control'),
      submenu: [
        {
          label: _('app_menu_play_previous_track'),
          accelerator: 'CmdOrCtrl+Left',
          click() {
            Player.playPreviousTrack();
          }
        },
        {
          label: _('app_menu_play_or_pause_track'),
          accelerator: 'CmdOrCtrl+P',
          click() {
            Player.playOrPause();
          }
        },
        {
          label: _('app_menu_play_next_track'),
          accelerator: 'CmdOrCtrl+Right',
          click() {
            Player.playNextTrack();
          }
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_increase_volume'),
          accelerator: 'CmdOrCtrl+Up',
          click() {
            Player.setVolume('up');
          }
        },
        {
          label: _('app_menu_decrease_volume'),
          accelerator: 'CmdOrCtrl+Down',
          click() {
            Player.setVolume('down');
          }
        },
        {
          type: 'separator'
        },
        {
          label: _('app_menu_download_track'),
          accelerator: 'CmdOrCtrl+D',
          click() {
            let track = Player.playingTrack;
            if (track) {
              let filename = track.title + '.' + track.ext;
              let src = track.platformTrackRealUrl;
              Dialog.showSaveDialog({
                title: _('app_menu_where_to_download_trak'),
                defaultPath: filename
              }, (path) => {
                if (path) {
                  Notifier.alert(_('app_menu_start_download_track'));
                  let req = DownloadManager.download(src, path);
                  req.on('error', () => {
                    Notifier.alert(_('app_menu_start_download_track_error'));
                  }).on('close', () => {
                    Notifier.alert(_('app_menu_start_download_track_success'));
                  });
                }
              });
            }
          }
        }
      ]
    };
  }

  _getMenuTemplateForWindow() {
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
  }

  _getMenusTemplateForCurrentPlatform() {
    let templates = [];
    let platform = process.platform;

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
}

module.exports = new AppMenus();
