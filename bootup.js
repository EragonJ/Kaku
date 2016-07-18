const path = require('path');
const { app, shell, Tray, Menu, crashReporter, BrowserWindow } = require('electron');
const ShortcutManager = require('electron-localshortcut');

// Report crashes to our server.
crashReporter.start();

// Kaku icon
const KakuIcon = path.join(__dirname + '/src/public/images/icons/kaku-desktop-icon.png');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;
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
        'icon': KakuIcon,
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
    const icon = path.join(__dirname, '/src/public/images/icons/kaku-toolbar-icon.png');
    const tray = new Tray(icon);
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
    tray.setTitle('Kaku App');
    tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  }
}

// booting Kaku
new Bootup();
