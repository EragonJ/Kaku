var $ = require('jquery');
var Bootstrap = require('bootstrap');
var Bootbox = require('bootbox');

var L10nManager = require('../../modules/L10nManager');

function Dialog() {}

[ 'alert',
  'confirm',
  'prompt',
  'setLocale'
].forEach((name) => {
  Dialog.prototype[name] = function() {
    Bootbox[name].apply(Bootbox, arguments);
  };
});

var dialog = new Dialog();

L10nManager.on('language-changed', (newLanguage) => {
  var transformedLanguage = newLanguage;

  // TODO
  // we have to make sure our language naming is the same with
  // bootbox's language.
  switch (newLanguage) {
    case 'zh-TW':
      transformedLanguage = 'zh_TW';
      break;

    default:
      transformedLanguage = 'en';
      break;
  }

  // TODO
  // not sure why when we use webpack, the translation will be weird for
  // Traditional Chinese, so switch to `en` as temporary solution.
  //
  // dialog.setLocale(transformedLanguage);
  dialog.setLocale('en');
});

module.exports = dialog;
