import Path from 'path';
import Semver from 'semver';
import GithubAPI from 'github';
import AppCore from './AppCore';
import YoutubeDlDownloader from 'youtube-dl/lib/downloader';

const Remote = require('electron').remote;
const App = Remote.app;

class AutoUpdater {
  constructor() {
    this._github = new GithubAPI({
      version: '3.0.0'
    });
  }

  _getRelease() {
    const promise = new Promise((resolve, reject) => {
      this._github.releases.listReleases({
        owner: 'EragonJ',
        repo: 'kaku'
      }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    return promise;
  }

  checkUpdate() {
    return this._getRelease().catch((error) => {
      console.error(error);
    })
    .then((result) => {
      if (result && result.length) {
        const release = this._getWrappedReleaseObject(result[0]);
        return release;
      }
    })
    .then((release = {}) => {
      const latestVersion = release.version;
      const currentVersion = AppCore.getPackageInfo().version;
      let isNewer = false;

      if (latestVersion) {
        isNewer = Semver.gt(latestVersion, currentVersion);
      }

      return {
        isNewer: isNewer,
        release: release
      };
    });
  }

  _getWrappedReleaseObject(result) {
    if (!result) {
      return {};
    }

    let assets = result.assets || [];
    let download = {};

    assets.forEach((rawAsset) => {
      const assetName = rawAsset.name;
      const asset = {
        link: rawAsset.browser_download_url,
        name: assetName
      };

      // Note
      // we should release Kaku with the format like this :
      // Kaku-mac.zip, Kaku-win.zip, Kaku-linux32.zip, Kaku-linux64.zip
      if (assetName.match(/mac/)) {
        download.mac = asset;
      }
      else if (assetName.match(/win/)) {
        download.win = asset;
      }
      else if (assetName.match(/linux32/)) {
        download.linux32 = asset;
      }
      else if (assetName.match(/linux64/)) {
        download.linux64 = asset;
      }
    });

    return {
      version: result.tag_name,
      title: result.name,
      note: result.body,
      download: download
    };
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
