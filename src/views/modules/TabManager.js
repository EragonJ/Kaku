import { EventEmitter } from 'events';

class TabManager extends EventEmitter {
  constructor() {
    super();

    // default tab is home
    this._tabName = 'home';
    this._tabOptions = undefined;

    Object.defineProperty(TabManager, 'currentTab', {
      enumerable: true,
      configurable: false,
      get() {
        return this._tabName;
      }
    });
  }

  setTab(tabName, tabOptions) {
    if (tabName === this._tabName && tabOptions === this._tabOptions) {
      return;
    }
    else {
      this._tabName = tabName;
      this._tabOptions = tabOptions;
      this.emit('changed', tabName, tabOptions);
    }
  }
}

module.exports = new TabManager();
