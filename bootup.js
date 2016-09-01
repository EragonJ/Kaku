const path = require('path');
const ShortcutManager = require('electron-localshortcut');
const {
  app,
  shell,
  Tray,
  Menu,
  BrowserWindow
} = require('electron');

const iconsFolder = path.join(__dirname, 'src', 'public', 'images', 'icons');
const kakuIcon = path.join(iconsFolder, 'kaku.png');
const trayDefaultIcon = path.join(iconsFolder, 'tray', 'default.png');
const trayWindowsIcon = path.join(iconsFolder, 'tray', 'windows.ico');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;
let tray = null;
let isWindowLoaded = false;

class Bootup {
  constructor() {
    this._setupBrowserWindow();
  }

  _setupBrowserWindow() {
    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // This method will be called when Electron has done everything
    // initialization and ready for creating browser windows.
    app.on('ready', () => {

      // Create the browser window.
      mainWindow = new BrowserWindow({
        'icon': kakuIcon,
        'width': 1060,
        'height': 600,
        'minWidth': 1060,
        'minHeight': 600,
        'frame': false
      });

      // and load the index.html of the app.
      mainWindow.loadURL('file://' + __dirname + '/index.html');

      // Emitted when the window is closed.
      mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
      });

      mainWindow.webContents.on('did-finish-load', () => {
        isWindowLoaded = true;
      });

      this._bindShortcuts();
      this._setToolBar(mainWindow);
    });
  }

  _bindShortcuts() {
    const shortcuts = [
      'MediaNextTrack',
      'MediaPreviousTrack',
      'MediaPlayPause',
      'Escape'
    ];

    shortcuts.forEach(shortcut => {
      ShortcutManager.register(shortcut, () => {
        this._emitShortcutEvent(mainWindow, isWindowLoaded, shortcut);
      });
    });
  }

  _emitShortcutEvent(win, isLoaded, shortcut) {
    if (isLoaded) {
      win.webContents.send('key-' + shortcut);
    }
  }

  _setToolBar(mainWindow) {
    let icon = trayDefaultIcon;
    if (process.platform === 'win32') {
      icon = trayWindowsIcon;
    }

    tray = new Tray(icon);

    const trayMenu = [{
      label: 'Show/Minimize',
      click() {
        !mainWindow.isMinimized() ? mainWindow.minimize() : mainWindow.show();
      }
    }, {
      label: 'Prev Track',
      click() {
        mainWindow.webContents.send('tray-MediaPreviousTrack');
      }
    }, {
      label: 'Next Track',
      click() {
        mainWindow.webContents.send('tray-MediaNextTrack');
      }
    }, {
      label: 'Play/Pause',
      click() {
        mainWindow.webContents.send('tray-MediaPlayPause');
      }
    }, {
      label: 'Help',
      submenu: [{
          label: 'Docs',
          click() {
            shell.openExternal('http://kaku.rocks/docs/index.html');
          }
        }, {
          label: 'Issue',
          click() {
            shell.openExternal('https://github.com/EragonJ/Kaku/issues');
          }
        }
      ]
    }, {
      label: 'Quit',
      click() {
        app.quit();
      }
    }];

    tray.setToolTip('Kaku');
    tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  }
}

// booting Kaku
new Bootup();
