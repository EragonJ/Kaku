suite('KakuCore', () => {
  'use strict';

  var rootPath = '../';
  var kakuCore;
  var sandbox;
  
  setup((done) => {
    // HACK
    global.__dirname = rootPath;
    sandbox = sinon.sandbox.create();

    testRequire([
      'backend/modules/KakuCore'
    ], {}, (KakuCore) => {
      kakuCore = KakuCore;
      sandbox.stub(kakuCore, 'emit');
      done();
    });
  });

  teardown(() => {
    sandbox.restore();
  });

  test("s", () => {
    assert.isTrue(true);
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

  test('getRootPath() >', () => {
    assert.equal(kakuCore.getRootPath(), rootPath);
  });

  test('getAppRootPath() >', () => {
    // default would be src
    assert.equal(kakuCore.getAppRootPath(), 'src');
  });

  test('getEnvInfo() >', () => {
    // default would be an empty object
    assert.deepEqual(kakuCore.getEnvInfo(), {});
  });
});
