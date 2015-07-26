'use strict';

var assert = require('assert');
var chai = require('chai');
var sinon = require('sinon');
var jsdom = require('jsdom').jsdom;
var requirejs = require('requirejs');
var rjsConfig = require('../config/rjs_config.json');

rjsConfig.baseUrl = './src/frontend';
rjsConfig.context = 0;
rjsConfig.paths.mocks = '../../tests/mocks';
rjsConfig.map = {};

requirejs.config(rjsConfig);

var testRequire = function(modules, mockMap, callback) {
  var ctx;
  if (arguments.length === 2) {
    callback = mockMap;
    mockMap = {};
  }

  rjsConfig.map = mockMap || {};
  rjsConfig.context ++;

  ctx = requirejs.config(rjsConfig);
  ctx(modules, callback);
  return ctx;
};

// We have to fake window object in node.js environment
var document = jsdom('_');
global.window = document.defaultView;

// other needed stuffs
global.requireNode = function() {
  // if we are going to require .json file,
  // we will directly mock them as an empty object.
  //
  // will think a better way in the future
  var moduleName = arguments[0];
  if (moduleName.match(/\.json$/)) {
    return {};
  }
  else {
    return require.apply(this, arguments);
  }
};
global.testRequire = testRequire;
global.assert = chai.assert;
global.sinon = sinon;

// TODO
// we should reset __dirname here

// TODO
// use sandbox in setup() & teardown()
