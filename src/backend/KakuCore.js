define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;
  var L10nManager = require('backend/L10nManager');

  var KakuCore = function() {
    EventEmitter.call(this);
    this._title = '';
    this._init();
  };

  KakuCore.prototype = Object.create(EventEmitter.prototype);
  KakuCore.constructor = KakuCore;

  Object.defineProperty(KakuCore.prototype, 'title', {
    enumerable: true,
    configurable: true,
    set: function(title) {
      this._title = title;
      this.emit('titleUpdated', title);
    },
    get: function() {
      return this._title;
    }
  });

  KakuCore.prototype._init = function() {
    L10nManager.get('app_title_normal').then((translatedTitle) => {
      this.title = translatedTitle;
    });
  };

  // singleton
  return new KakuCore();
});
