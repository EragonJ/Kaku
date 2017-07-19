const assert = require('assert');
const chai = require('chai');
const sinon = require('sinon');
const { JSDOM } = require('jsdom');
const proxyquire = require('proxyquire').noCallThru();

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

global.window = window;
global.document = window.document;
global.IS_TEST = true;
global.assert = chai.assert;
global.sinon = sinon;
global.proxyquire = proxyquire;
