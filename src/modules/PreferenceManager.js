import { EventEmitter } from 'events';

class PreferenceManager extends EventEmitter {
  constructor() {
    super();
    this._preferenceStorage = window.localStorage;
  }

  setPreference(key, newPreference) {
    const oldPreference = this.getPreference(key);
    if (oldPreference !== newPreference) {
      this._preferenceStorage[key] = newPreference;
      this.emit('preference-updated', key, newPreference, oldPreference);
    }
  }

  getPreference(key) {
    const preference = this._preferenceStorage[key];
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
  }
}

module.exports = new PreferenceManager();
