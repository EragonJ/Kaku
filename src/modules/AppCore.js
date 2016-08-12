import Fs from 'fs';
import Path from 'path';
import { remote } from 'electron';
import { EventEmitter } from 'events';

const App = remote.app;

class AppCore extends EventEmitter {
  constructor() {
    super();
    this._envInfo = null;
    this._title = '';

    Object.defineProperty(this, 'title', {
      enumerable: true,
      configurable: true,
      set(title) {
        this._title = title;
        this.emit('titleUpdated', title);
      },
      get() {
        return this._title;
      }
    });
  }

  isDev() {
    if (!this._envInfo) {
      this._envInfo = this.getEnvInfo();
    }
    return this._envInfo.env === 'development';
  }

  isProduction() {
    if (!this._envInfo) {
      this._envInfo = this.getEnvInfo();
    }
    return this._envInfo.env === 'production';
  }

  getEnvInfo() {
    const envFilePath = Path.join(App.getAppPath(), 'env.json');
    const envInfo = Fs.readFileSync(envFilePath, 'utf8');
    return JSON.parse(envInfo);
  }

  getPackageInfo() {
    const packageFilePath = Path.join(App.getAppPath(), 'package.json');
    const packageInfo = Fs.readFileSync(packageFilePath, 'utf8');
    return JSON.parse(packageInfo);
  }

  getInfoFromDataFolder(filename) {
    const filePath = Path.join(App.getAppPath(), 'data', filename);
    const fileInfo = Fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileInfo);
  }
}

module.exports = new AppCore();
