const Fs = require('fs');
const Path = require('path');
const { remote } = require('electron');
const { EventEmitter } = require('events');
const IniParser = require('kaku-core/modules/IniParser');
const L10nMetadata = require('../locales/metadata').languages;

const App = remote.app;

class L10nManager extends EventEmitter {
  constructor() {
    super();
    this._cachedStrings = {};
    this._currentLanguage = 'en';
    this._reParam = /\{\{\s*(\w+)\s*\}\}/g;

    // Because might have a lot of L10nSpan, so we should de-limit the number
    // of listeners here
    this.setMaxListeners(0);

    // prepare all needed strings
    L10nMetadata.forEach((language) => {
      let fileName = language.lang + '.ini';
      let languageFilePath = Path.join(
        App.getAppPath(), 'src', 'locales', fileName
      );
      let rawIniData = Fs.readFileSync(languageFilePath, 'utf-8');
      this._cachedStrings[language.lang] = IniParser.parse(rawIniData);
    }, this);

    this.emit('language-initialized');
  }

  changeLanguage(newLanguage) {
    if (this._currentLanguage === newLanguage) {
      return;
    }
    else {
      var oldLanguage = this._currentLanguage;
      this._currentLanguage = newLanguage;
      this.emit('language-changed', newLanguage, oldLanguage);
    }
  }

  get(id, params, fallbackToEn) {
    let currentLanguage = this._currentLanguage;

    if (fallbackToEn) {
      currentLanguage = 'en';
    }

    const rawString = this._cachedStrings[currentLanguage][id];
    const replacedString = this._getReplacedString(rawString, params);

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
  }

  getSupportedLanguages() {
    return L10nMetadata;
  }

  _getReplacedString(rawString, params) {
    let replacedString = rawString;
    let matched;
    let replacedParam;
    let foundError = false;

    do {
      matched = this._reParam.exec(replacedString);
      if (matched) {
        let matchedBracketSubject = matched[0];
        let matchedParamKey = matched[1];

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
  }
}

module.exports = new L10nManager();
