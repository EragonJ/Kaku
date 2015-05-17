define(function(require) {
  'use strict';

  var IniParser = require('backend/IniParser');
  var EventEmitter = requireNode('events').EventEmitter;
  var fs = requireNode('fs');
  var path = requireNode('path');
  
  const EVENTS = {
    LANGUAGE_CHANGED: 'language-changed'
  };

  var L10nManager = function() {
    this._cachedStrings = {};
    this._l10nFolder = path.join(__dirname, 'locales');
    this._currentLanguage = 'en';
    this._reParam = /\{\{\s*(\w+)\s*\}\}/g;
  };
  
  L10nManager.prototype = Object.create(EventEmitter.prototype);
  L10nManager.constructor = L10nManager;

  L10nManager.prototype.init = function(defaultLanguage) {
    // we can change default language if needed (from users' settings)
    if (defaultLanguage) {
      this._currentLanguage = defaultLanguage;
    }
    return this._fetchLanguageFileAndStore(this._currentLanguage);
  };

  L10nManager.prototype._fetchLanguageFileAndStore = function(language) {
    // it means that we already have related l10n strings
    if (Object.keys(this._cachedStrings[language]).length > 0) {
      return Promise.resolve();
    }
    else {
      return this._fetchLanguageFile(language).then((result) => {
        this._cachedStrings[language] = result;
      });
    }
  };

  L10nManager.prototype._fetchLanguageFile = function(language) {
    var promise = new Promise((resolve, reject) => {
      var languageFilePath = this._l10nFolder + language;
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
  };

  L10nManager.prototype.changeLanguage = function(newLanguage) {
    if (this._currentLanguage === newLanguage) {
      return;
    }
    else {
      var oldLanguage = this._currentLanguage;
      this._currentLanguage = newLanguage;

      this._fetchLanguageFileAndStore(newLanguage).then(() => {
        this.emit(EVENTS.LANGUAGE_CHANGED, newLanguage, oldLanguage);
      });
    }
  };

  L10nManager.prototype.get = function(id, params, fallbackToEn) {
    var currentLanguage = this._currentLanguage;

    if (fallbackToEn) {
      currentLanguage = 'en';
    }

    var rawString = this._cachedStrings[currentLanguage];
    var replacedString = this._getReplacedString(rawString, params);

    if (!replacedString) {
      console.log('You are accessing a non-exist l10nId : ', id, 
        ' in lang: ', currentLanguage);
      // If we still find nothing in `en`, we should exit directly.
      if (fallbackToEn) {
        return '';
      }
      else {
        return this.get(id, params, true);
      }
    }
    else {
      return replacedString;
    }
  };

  L10nManager.prototype._getReplacedString = function(rawString, params) {
    var replacedString = rawString;
    var matched;
    var replacedParam;
    var foundError = false;

    while (matched = replacedString.exec(this._reParam) && !foundError) {
      var matchedBracketSubject = matched && matched[0];
      var matchedParamKey = matched && matched[1]; 

      if (matchedBracketSubject && matchedParamKey) {
        replacedParam = params[matchedParamKey];

        // we find a {{ xxx }} block, but there is no related key to replace it
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
    return replacedString;
  };
});
