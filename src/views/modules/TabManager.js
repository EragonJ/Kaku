var EventEmitter = require('events').EventEmitter;

function TabManager() {
  EventEmitter.call(this);

  // default tab is home
  this._currentTab = 'home';
}

TabManager.prototype = Object.create(EventEmitter.prototype);
TabManager.constructor = TabManager;

Object.defineProperty(TabManager, 'currentTab', {
  enumerable: true,
  configurable: false,
  get: function() {
    return this._currentTab;
  }
});

TabManager.prototype.setTab = function(tabName, tabOptions) {
  this.emit('changed', tabName, tabOptions);
};

module.exports = new TabManager();
