require('electron-reload')(__dirname);

const autoUpdater = require('electron-updater').autoUpdater;
const path = require('path');
const ShortcutManager = require('electron-localshortcut');

const {
  app,
  BrowserWindow,
  globalShortcut,
  TouchBar,
  ipcMain,
  Menu
} = require('electron');

const {
  TouchBarLabel,
  TouchBarButton,
  TouchBarSpacer,
  TouchBarSlider
} = TouchBar;

const iconsFolder = path.join(__dirname, 'src', 'public', 'images', 'icons');
const kakuIcon = path.join(iconsFolder, 'kaku.png');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

class Bootup {
  constructor(mainWindow) {
    this._mainWindow = mainWindow;
    this._setupBrowserWindow();
  }

  _resetMenus() {
    // initialize empty menus, all logics will be handled in AppMenus
    const menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu);
  }

  _resetTouchBar() {
    if (!this._mainWindow) {
      return;
    }

    const playOrPauseButton = new TouchBarButton({
      label: 'Play / Pause',
      click: () => {
        this._emitShortcutEvent(this._mainWindow, 'MediaPlayPause');
      }
    });

    const playPreviousButton = new TouchBarButton({
      label: '◀ Previous Track',
      click: () => {
        this._emitShortcutEvent(this._mainWindow, 'MediaPreviousTrack');
      }
    });

    const playNextButton = new TouchBarButton({
      label: 'Next Track ▶',
      click: () => {
        this._emitShortcutEvent(this._mainWindow, 'MediaNextTrack');
      }
    });

    const touchbar = new TouchBar([
      new TouchBarSpacer({size: 'flexible'}),
      playPreviousButton,
      playOrPauseButton,
      playNextButton
    ]);

    this._mainWindow.setTouchBar(touchbar);
  }

  _setupBrowserWindow() {
    // This may help the black screen / option issue
    app.disableHardwareAcceleration();

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (!this._mainWindow) {
        this._spawnWindow();
        this._resetTouchBar();
      }
    });

    // This method will be called when Electron has done everything
    // initialization and ready for creating browser windows.
    app.on('ready', () => {
      this._resetMenus();
      this._spawnWindow();
      this._resetTouchBar();
      this._bindShortcuts();
      this._bindAutoUpdate();
    });
  }

  _spawnWindow() {
    // Create the browser window.
    this._mainWindow = new BrowserWindow({
      'icon': kakuIcon,
      'width': 1060,
      'height': 600,
      'minWidth': 1060,
      'minHeight': 600,
      'frame': false
    });

    // and load the index.html of the app.
    this._mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    this._mainWindow.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this._mainWindow = null;
    });
  }

  _bindShortcuts() {
    const localKeys = [
      'Escape'
    ];

    const globalKeys = [
      'MediaNextTrack',
      'MediaPreviousTrack',
      'MediaPlayPause'
    ];

    globalKeys.forEach(key => {
      globalShortcut.register(key, () => {
        this._emitShortcutEvent(this._mainWindow, key);
      });
    });

    localKeys.forEach(key => {
      ShortcutManager.register(key, () => {
        this._emitShortcutEvent(this._mainWindow, key);
      });
    });
  }

  _bindAutoUpdate() {
    autoUpdater.on('checking-for-update', (e) => {
      this._mainWindow.webContents.send('au-checking-for-update', e);
    });

    autoUpdater.on('update-available', (e) => {
      this._mainWindow.webContents.send('au-update-available', e);
    });

    autoUpdater.on('update-not-available', (e) => {
      this._mainWindow.webContents.send('au-update-not-available', e);
    });

    autoUpdater.on('error', (e, error) => {
      this._mainWindow.webContents.send('au-error', e, error);
    });

    autoUpdater.on('update-downloaded', (e, info) => {
      this._mainWindow.webContents.send('au-update-downloaded', e, info);
		});

    ipcMain.on('au-check-for-update', (e, isDev) => {
      if (!isDev) {
        autoUpdater.checkForUpdates();
      }
    });

    ipcMain.on('au-quit-and-install', () => {
      autoUpdater.quitAndInstall();
    });
  }

  _emitShortcutEvent(win, shortcut) {
    if (win) {
      win.webContents.send('key-' + shortcut);
    }
  }
}

new Bootup(mainWindow);
