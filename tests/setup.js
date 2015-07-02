'use strict';

var assert = require('assert');
var chai = require('chai');
var sinon = require('sinon');
var jsdom = require('jsdom').jsdom;
var requirejs = require('requirejs');
var rjsConfig = require('../config/rjs_config.json');

var contextId = 0;

rjsConfig.baseUrl = './src/frontend';
rjsConfig.context = contextId;
rjsConfig.paths.mocks = '../../tests/mocks';
rjsConfig.map = {};

requirejs.config(rjsConfig);

var testRequire = function(modules, mockMap, callback) {
  var ctx;
  if (arguments.length === 2) {
    callback = mockMap;
    mockMap = {};
  }

  contextId ++;
  rjsConfig.map = mockMap || {};

  ctx = requirejs.config(rjsConfig);
  ctx(modules, callback);
  return ctx;
};

// We have to fake window object in node.js environment
var document = jsdom('_');
global.window = document.defaultView;

// other needed stuffs
global.requireNode = require;
global.testRequire = testRequire;
global.assert = chai.assert;
global.sinon = sinon;

// TODO
// use sandbox in setup() & teardown()
