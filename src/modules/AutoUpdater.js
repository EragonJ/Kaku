import Electron from 'electron';
const IpcRenderer = Electron.ipcRenderer;
const Remote = Electron.remote;
const App = Remote.app;
const Dialog = Remote.dialog;

import os from 'os';
import Path from 'path';
import AppCore from './AppCore';
import Constants from './Constants';
import L10nManager from './L10nManager';
import { Downloader } from 'kaku-core/modules/YoutubeDL';

const _ = L10nManager.get.bind(L10nManager);
const ytdlDownloader = new Downloader();
ytdlDownloader.setPath(App.getPath('userData'))

class AutoUpdater {
  constructor() {
    if (AppCore.isDev()) {
      return;
    }

    if (os.platform() !== 'darwin' && os.platform() !== 'win32') {
      return;
    }

    IpcRenderer.on('au-checking-for-update', (e) => {
      console.log('found a new update');
    });

    IpcRenderer.on('au-update-available', (e) => {
      console.log('update is available');
    });

    IpcRenderer.on('au-update-not-available', (e) => {
      console.log('update not available');
    });

    IpcRenderer.on('au-error', (e, error) => {
      console.log(error);
    });

    IpcRenderer.on('au-update-downloaded', (e, info) => {
      let {releaseName} = info;

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
          IpcRenderer.send('au-quit-and-install');
        }
      });
    });
  }

  updateApp() {
    IpcRenderer.send('au-check-for-update', AppCore.isDev());
  }

  updateYoutubeDl(force=false) {
    return ytdlDownloader.save(os.platform(), force);
  }
}

module.exports = new AutoUpdater();
