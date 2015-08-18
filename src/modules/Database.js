var PouchDB = require('pouchdb');
var KakuDB = new PouchDB('kaku');

// Note:
// Because we add something new in the prototype chain and this is not safe,
// we added some prefix to make it unique
PouchDB.prototype.resetDatabase = function() {
  return this.destroy().catch((error) => {
    console.log('Something goes wrong when dropping database');
    console.log(error);
  });
};

module.exports = KakuDB;
