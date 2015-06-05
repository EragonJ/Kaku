'use strict';

var assert = require('assert');
var chai = require('chai');
var sinon = require('sinon');
var jsdom = require('jsdom').jsdom;
var requirejs = require('requirejs');
var rjsConfig = require('../config/rjs_config.json');

rjsConfig.baseUrl = './src/frontend';
requirejs.config(rjsConfig);

var testRequire = function(modules, map, callback) {
  var ctx;
  var contextId = 0;
  if (arguments.length === 2) {
    callback = map;
    map = null;
  }

  ctx = requirejs.config({
    context: contextId++
  });

  // TODO
  // need to fix here ?
  //
  // console.log(ctx.config);
  // ctx.config(rjsConfig);
  // ctx.config({
  //   map: map || {}
  // });

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
