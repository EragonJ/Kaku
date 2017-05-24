import PouchDB from 'pouchdb-browser';
let opt = {};

if (global && global.IS_TEST === true) {
  PouchDB.plugin(require('pouchdb-adapter-memory'));
  opt.adapter = 'memory';
}
else {
  opt.adapter = 'idb';
}

const KakuDB = new PouchDB('kaku', opt);

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
