'use strict';

var chromeDriverProcess;

var chaiAsPromised = require('chai-as-promised');
var childProcess = require('child_process');
var chromedriver = require('chromedriver');
var webdriverio = require('webdriverio');

var kakuPath;

// Note
// we only support Mac & linux platform for uitest for now.
switch (process.platform) {
  case 'darwin':
    kakuPath = './build/Kaku-darwin-x64/Kaku.app/Contents/MacOS/Electron';
    break;

  default:
    kakuPath = './build/app/Kaku';
    break;
}

var client = webdriverio.remote({
  host: 'localhost',
  port: 9515,
  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {
      binary: kakuPath
    }
  }
});

var assert = require('assert');
var chai = require('chai');

// Note
// we will create a child process for chromeDriver when running tests
beforeEach((done) => {
  chromeDriverProcess = childProcess.execFile(chromedriver.path, [
    '--url-base=/wd/hub',
    '--port=9515'
  ]);

  setTimeout(() => {
    done();
  }, 1000);
});

afterEach(() => {
  if (chromeDriverProcess !== null) {
    chromeDriverProcess.kill();
  }
});

chai.use(chaiAsPromised);
global.assert = chai.assert;
global.Kaku = client;
