import os from 'os';
import Path from 'path';
import AppCore from './AppCore';
import YoutubeDlDownloader from 'youtube-dl/lib/downloader';
import Constants from './Constants';

const Remote = require('electron').remote;
const App = Remote.app;
const Updater = Remote.autoUpdater;
const Dialog = Remote.dialog;

class AutoUpdater {
  constructor() {
    if (AppCore.isDev()) {
      return;
    }

    if (os.platform() !== 'darwin' && os.platform() !== 'win32') {
      return;
    }

    if (os.platform() === 'win32' && os.arch() !== 'x64') {
      return;
    }

    this._hasFeedUrl = true;

    Updater.on('checking-for-update', (e) => {
      console.log('found a new update');
    });

    Updater.on('update-available', (e) => {
      console.log('update is available');
    });

    Updater.on('update-not-available', (e) => {
      console.log('update not available');
    });

    Updater.on('error', (error) => {
      console.log(error);
    });

    Updater.on('update-downloaded', (e, releaseNotes, releaseName, releaseDate, updateURL) => {
      console.log('update downloaded');

      let title = 'A new update is ready to install';
      let message = `Version ${releaseName} is downloaded`;
      message += ' and will be automatically installed on Quit';

      Dialog.showMessageBox({
        type: 'question',
        title: title,
        message: message,
        buttons: ['Yes', 'No'],
        cancelId: -1
      }, (response) => {
        if (response === 0) {
          Updater.quitAndInstall();
        }
      });
    });

    Updater.setFeedURL(this._getFeedUrl());
  }

  _getFeedUrl() {
    let version = App.getVersion();
    let url = Constants.DESKTOP_UPDATE_SERVER_URL + '/desktop/update';

    if (os.platform() === 'darwin') {
      url += `/osx/${version}`;
    }
    else {
      url += `/win32/${version}/RELEASES`;
    }

    return url;
  }

  updateApp() {
    if (this._hasFeedUrl) {
      Updater.checkForUpdates();
    }
  }

  updateYoutubeDl() {
    let ytdlBinPath = App.getAppPath();
    let appPath;

    if (AppCore.isProduction()) {
      ytdlBinPath = Path.join(ytdlBinPath, '..', 'app.asar.unpacked');
    }

    ytdlBinPath = Path.join(ytdlBinPath, 'node_modules', 'youtube-dl', 'bin');

    let promise = new Promise((resolve, reject) => {
      YoutubeDlDownloader(ytdlBinPath, (error) => {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      });
    });

    return promise;
  }
}

module.exports = new AutoUpdater();
