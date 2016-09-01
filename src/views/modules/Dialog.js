import $ from 'jquery';
import Bootstrap from 'bootstrap';
import Bootbox from 'bootbox';
import L10nManager from '../../modules/L10nManager';

function Dialog() {}

[ 'alert',
  'confirm',
  'prompt',
  'setLocale'
].forEach((name) => {
  Dialog.prototype[name] = () => {
    Bootbox[name].apply(Bootbox, arguments);
  };
});

const dialog = new Dialog();

L10nManager.on('language-changed', (newLanguage) => {
  let transformedLanguage = newLanguage;

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

module.exports = dialog;
