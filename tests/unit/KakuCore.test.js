suite('KakuCore', () => {
  'use strict';

  var kakuCore;
  var sandbox;
  
  setup(() => {
    kakuCore = proxyquire('../../src/modules/KakuCore', {
      electron: require('./mocks/Electron')
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
