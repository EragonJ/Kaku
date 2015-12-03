suite('KakuCore', () => {
  'use strict';

  var kakuCore;
  var sandbox;
  var mockRemote;
  
  setup(() => {
    mockRemote = require('./mocks/Remote');
    kakuCore = proxyquire('../../src/modules/KakuCore', {
      remote: mockRemote
    });
    sandbox = sinon.sandbox.create();
    sandbox.stub(kakuCore, 'emit');
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('.title >', () => {
    setup(() => {
      kakuCore.title = 'test';
    });
    
    test('title will be updated and also emit needed event', () => {
      assert.equal(kakuCore._title, 'test');
      assert.isTrue(kakuCore.emit.calledWith('titleUpdated', 'test'));
    });
  });
});
