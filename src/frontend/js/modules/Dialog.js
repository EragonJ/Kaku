define(function(require) {
  'use strict';

  var L10nManager = require('backend/modules/L10nManager');
  var Bootbox = require('bootbox');

  var Dialog = function() {

  };

  var SUPPORT_FUNCTIONS = [
    'alert',
    'confirm',
    'prompt',
    'setLocale'
  ];

  SUPPORT_FUNCTIONS.forEach((name) => {
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

    dialog.setLocale(transformedLanguage);
  });
  
  // singleton
  return dialog;
});
