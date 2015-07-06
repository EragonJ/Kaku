define(function(require) {
  'use strict';

  var EventEmitter = requireNode('events').EventEmitter;

  var PreferenceManager = function() {
    EventEmitter.call(this);
    this._preferenceStorage = window.localStorage;
  };

  PreferenceManager.prototype = Object.create(EventEmitter.prototype);
  PreferenceManager.constructor = PreferenceManager;

  PreferenceManager.prototype.setPreference = function(key, newPreference) {
    var oldPreference = this.getPreference(key);
    if (oldPreference !== newPreference) {
      this._preferenceStorage[key] = newPreference;
      this.emit('preference-updated', key, newPreference, oldPreference);
    }
  };

  PreferenceManager.prototype.getPreference = function(key) {
    var preference = this._preferenceStorage[key];
    if (preference === 'true') {
      return true;
    }
    else if (preference === 'false') {
      return false;
    }
    else if (typeof preference === 'undefined') {
      return false;
    }
    else {
      return preference;
    }
  };

  return new PreferenceManager();
});
