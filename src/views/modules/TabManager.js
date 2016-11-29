import { EventEmitter } from 'events';

class TabManager extends EventEmitter {
  constructor() {
    super();

    // default tab is home
    this.tabName = 'home';
    this.tabOptions = undefined;
  }

  setTab(tabName, tabOptions) {
    if (tabName === this.tabName && tabOptions === this.tabOptions) {
      return;
    }
    else {
      this.tabName = tabName;
      this.tabOptions = tabOptions;
      this.emit('changed', tabName, tabOptions);
    }
  }
}

module.exports = new TabManager();
