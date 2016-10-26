import Electron from 'electron';
import path from 'path';
import L10nManager from '../../modules/L10nManager';

const Shell = Electron.shell;
const Remote = Electron.remote;
const Dialog = Remote.dialog;
const Menu = Remote.Menu;
const Tray = Remote.Tray;
const App = Remote.app;

const _ = L10nManager.get.bind(L10nManager);
const iconsFolder =
  path.join(App.getAppPath(), 'src', 'public', 'images', 'icons');
const trayDefaultIcon = path.join(iconsFolder, 'tray', 'default.png');
const trayWindowsIcon = path.join(iconsFolder, 'tray', 'windows.ico');

class AppTray {
  constructor() {
    this.tray = null;

    L10nManager.on('language-changed', () => {
      this.destroy();
      this.build();
    });
  }

  build() {
    let mainWindow = Remote.getCurrentWindow();
    let icon = trayDefaultIcon;

    if (process.platform === 'win32') {
      icon = trayWindowsIcon;
    }

    this.tray = new Tray(icon);

    const trayMenu = [
      {
        label: _('app_tray_show_or_minimize'),
        click() {
          !mainWindow.isMinimized() ? mainWindow.minimize() : mainWindow.show();
        }
      },
      {
        type: 'separator'
      },
      {
        label: _('app_tray_play_previous_track'),
        click() {
          mainWindow.webContents.send('tray-MediaPreviousTrack');
        }
      },
      {
        label: _('app_tray_play_next_track'),
        click() {
          mainWindow.webContents.send('tray-MediaNextTrack');
        }
      },
      {
        label: _('app_tray_play_or_pause_track'),
        click() {
          mainWindow.webContents.send('tray-MediaPlayPause');
        }
      },
      {
        type: 'separator'
      },
      {
        label: _('app_tray_help'),
        submenu: [{
            label: _('app_tray_docs'),
            click() {
              Shell.openExternal('http://kaku.rocks/docs/index.html');
            }
          }, {
            label: _('app_tray_issue'),
            click() {
              Shell.openExternal('https://github.com/EragonJ/Kaku/issues');
            }
          }
        ]
      },
      {
        label: _('app_tray_quit'),
        click() {
          App.quit();
        }
      }
    ];

    this.tray.setToolTip('Kaku');
    this.tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
    }
  }
}

module.exports = new AppTray();
