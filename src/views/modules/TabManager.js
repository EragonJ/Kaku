import { EventEmitter } from 'events';

class TabManager extends EventEmitter {
  constructor() {
    super();

    // default tab is home
    this._currentTab = 'home';

    Object.defineProperty(TabManager, 'currentTab', {
      enumerable: true,
      configurable: false,
      get() {
        return this._currentTab;
      }
    });
  }

  setTab(tabName, tabOptions) {
    this.emit('changed', tabName, tabOptions);
  }
}

module.exports = new TabManager();
