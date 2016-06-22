suite('AppCore', () => {
  'use strict';

  var AppCore;
  var sandbox;
  
  setup(() => {
    AppCore = proxyquire('../../src/modules/AppCore', {
      electron: require('./mocks/Electron')
    });
    sandbox = sinon.sandbox.create();
    sandbox.stub(AppCore, 'emit');
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('.title >', () => {
    setup(() => {
      AppCore.title = 'test';
    });
    
    test('title will be updated and also emit needed event', () => {
      assert.equal(AppCore._title, 'test');
      assert.isTrue(AppCore.emit.calledWith('titleUpdated', 'test'));
    });
  });
});
