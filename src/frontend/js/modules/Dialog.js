define(function(require) {
  'use strict';

  var Bootbox = require('bootbox');

  var Dialog = function() {

  };

  var SUPPORT_FUNCTIONS = [
    'alert',
    'confirm',
    'prompt'
  ];

  SUPPORT_FUNCTIONS.forEach((name) => {
    Dialog.prototype[name] = function() {
      Bootbox[name].apply(Bootbox, arguments);
    };
  });
  
  // singleton
  return new Dialog();
});
