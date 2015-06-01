define(function(require) {
  'use strict';

  var PouchDB = require('pouchdb');
  var KakuDB = new PouchDB('kaku');

  return KakuDB;
});
