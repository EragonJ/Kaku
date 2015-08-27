var Fs = require('fs');
var Path = require('path');
var Remote = require('remote');
var App = Remote.require('app');
var EventEmitter = require('events').EventEmitter;
var IniParser = require('../modules/IniParser');
var L10nMetadata = require('../locales/metadata').languages;

function L10nManager() {
  EventEmitter.call(this);

  this._cachedStrings = {};
  this._currentLanguage = 'en';
  this._reParam = /\{\{\s*(\w+)\s*\}\}/g;

  // Because might have a lot of L10nSpan, so we should de-limit the number
  // of listeners here
  this.setMaxListeners(0);

  // prepare all needed strings
  L10nMetadata.forEach((language) => {
    var fileName = language.lang + '.ini';
    var languageFilePath = Path.join(
      App.getAppPath(), 'src', 'locales', fileName);
    var rawIniData = Fs.readFileSync(languageFilePath, 'utf-8');
    this._cachedStrings[language.lang] = IniParser.parse(rawIniData);
  }, this);

  this.emit('language-initialized');
}

L10nManager.prototype = Object.create(EventEmitter.prototype);
L10nManager.constructor = L10nManager;

L10nManager.prototype.changeLanguage = function(newLanguage) {
  if (this._currentLanguage === newLanguage) {
    return;
  }
  else {
    var oldLanguage = this._currentLanguage;
    this._currentLanguage = newLanguage;
    this.emit('language-changed', newLanguage, oldLanguage);
  }
};

L10nManager.prototype.get = function(id, params, fallbackToEn) {
  var currentLanguage = this._currentLanguage;

  if (fallbackToEn) {
    currentLanguage = 'en';
  }

  var rawString = this._cachedStrings[currentLanguage][id];
  var replacedString = this._getReplacedString(rawString, params);

  if (!replacedString) {
    console.error(
      'You are accessing a non-exist l10nId : ', id,
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

L10nManager.prototype.getSupportedLanguages = function() {
  return L10nMetadata;
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

module.exports = new L10nManager();
