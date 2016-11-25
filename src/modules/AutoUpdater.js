import os from 'os';
import Path from 'path';
import AppCore from './AppCore';
import YoutubeDlDownloader from 'youtube-dl/lib/downloader';
import Constants from './Constants';
import L10nManager from './L10nManager';

const Remote = require('electron').remote;
const App = Remote.app;
const Updater = Remote.autoUpdater;
const Dialog = Remote.dialog;
const _ = L10nManager.get.bind(L10nManager);

class AutoUpdater {
  constructor() {
    if (AppCore.isDev()) {
      return;
    }

    if (os.platform() !== 'darwin' && os.platform() !== 'win32') {
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

    Updater.on('update-downloaded',
      (e, releaseNotes, releaseName, releaseDate, updateURL) => {
        console.log('update downloaded');

        let title = _('autoupdater_found_update_title');
        let message = _('autoupdater_found_update_message', {
          version:  releaseName
        });

        Dialog.showMessageBox({
          type: 'question',
          title: title,
          message: message,
          buttons: [
            _('autoupdater_yes_button_wording'),
            _('autoupdater_no_button_wording')
          ],
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
    let url = Constants.API.KAKU_SERVER_URL + '/desktop/update';

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
