define(function(require) {
  'use strict';

  var PouchDB = requireNode('pouchdb');
  var KakuDB = new PouchDB('kaku');

  return KakuDB;
});
