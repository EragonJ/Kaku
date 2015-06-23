suite('PreferenceManager', () => {
  'use strict';

  var preferenceManager;

  setup((done) => {
    testRequire(['backend/PreferenceManager'], {}, (PreferenceManager) => {
      preferenceManager = PreferenceManager;
      preferenceManager._preferenceStorage = {};
      done();
    });
  });

  suite('setPreference() >', () => {
    var testKey = 'testKey';
    var sandbox = sinon.sandbox.create();

    setup(() => {
      sandbox.stub(preferenceManager, 'emit');
    });

    teardown(() => {
      sandbox.restore();
    });

    test('if preference is still the same, do nothing', () => {
      preferenceManager._preferenceStorage[testKey] = 'true';
      preferenceManager.setPreference(testKey, true);
      assert.isFalse(preferenceManager.emit.called);
    });

    test('if preference is different, do emit', () => {
      preferenceManager._preferenceStorage[testKey] = 'true';
      preferenceManager.setPreference(testKey, false);
      assert.ok(preferenceManager.emit.calledWith('preference-updated'));
    });
  });

  suite('getPreference() > ', () => {
    var testKey = 'testKey';

    test('\'true\' would be true', () => {
      preferenceManager._preferenceStorage[testKey] = 'true';
      assert.equal(preferenceManager.getPreference(testKey), true);
    });

    test('\'false\' would be false', () => {
      preferenceManager._preferenceStorage[testKey] = 'false';
      assert.equal(preferenceManager.getPreference(testKey), false);
    });

    test('undefined would be false', () => {
      preferenceManager._preferenceStorage[testKey] = undefined;
      assert.equal(preferenceManager.getPreference(testKey), false);
    });

    test('othwers would be its original value', () => {
      preferenceManager._preferenceStorage[testKey] = 'test';
      assert.equal(preferenceManager.getPreference(testKey), 'test');
    });
  });
});
