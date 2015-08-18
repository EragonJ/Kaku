var EventEmitter = require('events').EventEmitter;

function PreferenceManager() {
  EventEmitter.call(this);
  this._preferenceStorage = window.localStorage;
}

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

module.exports = new PreferenceManager();
