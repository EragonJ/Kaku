define(function(require) {
  'use strict';

  var IniParser = require('backend/modules/IniParser');
  var EventEmitter = requireNode('events').EventEmitter;
  var fs = requireNode('fs');
  var path = requireNode('path');
  // [Note]
  // We can't use __dirname because we use requirejs to load all scripts,
  // and this will always report the root to be kaku/, instead, we have to
  // use requirejs's API to get the right path
  var basePath = (__dirname + '/' + require.toUrl('.'));

  var L10nManager = function() {
    EventEmitter.call(this);

    this._cachedStrings = {};
    this._cachedMetadata = null;

    this._l10nFolderPath = path.join(basePath, '..', 'locales');
    this._metadataPath = path.join(this._l10nFolderPath, 'metadata.json');
    this._suffixForLanguageFile = '.ini';

    // Note
    // we will reflect real value from PreferenceManager in frontend/main.js
    this._currentLanguage = 'en';
    this._reParam = /\{\{\s*(\w+)\s*\}\}/g;

    // Because might have a lot of L10nSpan, so we should de-limit the number
    // of listeners here
    this.setMaxListeners(0);

    this._init();
  };

  L10nManager.prototype = Object.create(EventEmitter.prototype);
  L10nManager.constructor = L10nManager;

  L10nManager.prototype._init = function() {
    return this._ready(this._currentLanguage);
  };

  L10nManager.prototype._ready = function(language) {
    var self = this;
    // it means that we already have related l10n strings
    if (this._cachedStrings[language]) {
      return Promise.resolve();
    }
    else {
      return this._fetchLanguageFile(language).then((result) => {
        self._cachedStrings[language] = result;
        self.emit('language-initialized');
      });
    }
  };

  L10nManager.prototype._fetchLanguageFile = function(language) {
    var promise = new Promise((resolve, reject) => {
      var fileName = language + this._suffixForLanguageFile;
      var languageFilePath = path.join(this._l10nFolderPath, fileName);
      fs.readFile(languageFilePath, 'utf-8', (error, rawIniData) => {
        if (error) {
          reject(error);
        }
        else {
          var parsedInitData = IniParser.parse(rawIniData);
          resolve(parsedInitData);
        }
      });
    });
    return promise;
  };

  L10nManager.prototype.changeLanguage = function(newLanguage) {
    var self = this;
    if (this._currentLanguage === newLanguage) {
      return;
    }
    else {
      var oldLanguage = this._currentLanguage;
      this._currentLanguage = newLanguage;

      return this._ready(newLanguage).then(() => {
        self.emit('language-changed', newLanguage, oldLanguage);
      });
    }
  };

  L10nManager.prototype.getSupportedLanguages = function() {
    if (this._cachedMetadata) {
      return Promise.resolve(this._cachedMetadata);
    }
    else {
      var promise = new Promise((resolve, reject) => {
        fs.readFile(this._metadataPath, 'utf-8', (error, rawMetadata) => {
          if (error) {
            reject(error);
          }
          else {
            this._cachedMetadata = JSON.parse(rawMetadata);
            resolve(this._cachedMetadata.languages);
          }
        });
      });
      return promise;
    }
  };

  L10nManager.prototype.get = function(id, params, fallbackToEn) {
    var self = this;
    var currentLanguage = this._currentLanguage;

    if (fallbackToEn) {
      currentLanguage = 'en';
    }

    return this._ready(currentLanguage).then(() => {
      var rawString = self._cachedStrings[currentLanguage][id];
      var replacedString = self._getReplacedString(rawString, params);

      if (!replacedString) {
        console.error('You are accessing a non-exist l10nId : ', id,
          ' in lang: ', currentLanguage);
        // If we still find nothing in `en`, we should exit directly.
        if (fallbackToEn) {
          return '';
        }
        else {
          return self.get(id, params, true);
        }
      }
      else {
        return replacedString;
      }
    });
  };

  L10nManager.prototype._getReplacedString = function(rawString, params) {
    var replacedString = rawString;
    var matched;
    var replacedParam;
    var foundError = false;

    do {
      matched = this._reParam.exec(replacedString);
      if (matched) {
        var matchedBracketSubject = matched[0];
        var matchedParamKey = matched[1];

        if (matchedBracketSubject && matchedParamKey) {
          replacedParam = params[matchedParamKey];

          // we find a {{ xxx }} block,
          // but there is no related key to replace it
          if (!replacedParam) {
            // in order not to get stucked in infinite loop, let's make sure
            // we would jump out.
            foundError = true;
            console.log('we can\'t find related param - ', matchedParamKey,
              ' to replace it, please check your passing params again');
          }
          else {
            replacedString = replacedString.replace(
              matchedBracketSubject, replacedParam);
          }
        }
      }
    } while(matched && !foundError);

    return replacedString;
  };

  // singleton
  return new L10nManager();
});
