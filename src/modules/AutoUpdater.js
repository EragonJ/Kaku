import Path from 'path';
import AppCore from './AppCore';
import YoutubeDlDownloader from 'youtube-dl/lib/downloader';

const Remote = require('electron').remote;
const App = Remote.app;

class AutoUpdater {
  constructor() {

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
