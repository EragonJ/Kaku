define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;

  var TabManager = function() {
    EventEmitter.call(this);

    // default tab is home
    this._currentTab = 'home';
  };

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

  // singleton
  return new TabManager();
});
