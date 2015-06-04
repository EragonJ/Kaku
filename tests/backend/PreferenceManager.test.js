require('../setup');

suite('Dialog', function() {
  var preferenceManager;

  setup(function(done) {
    testRequire(['backend/PreferenceManager'], {}, function(PreferenceManager) {
      preferenceManager = PreferenceManager;
      preferenceManager._preferenceStorage = {};
      done();
    });
  });

  suite('setPreference() >', function() {
    var testKey = 'testKey';
    var sandbox = sinon.sandbox.create();

    setup(function() {
      sandbox.stub(preferenceManager, 'emit');
    });

    teardown(function() {
      sandbox.restore();
    });

    test('if preference is still the same, do nothing', function() {
      preferenceManager._preferenceStorage[testKey] = 'true';
      preferenceManager.setPreference(testKey, true);
      assert.isFalse(preferenceManager.emit.called);
    });

    test('if preference is different, do emit', function() {
      preferenceManager._preferenceStorage[testKey] = 'true';
      preferenceManager.setPreference(testKey, false);
      assert.ok(preferenceManager.emit.calledWith('preference-updated'));
    });
  });

  suite('getPreference() > ', function() {
    var testKey = 'testKey';

    test('\'true\' would be true', function() {
      preferenceManager._preferenceStorage[testKey] = 'true';
      assert.equal(preferenceManager.getPreference(testKey), true);
    });

    test('\'false\' would be false', function() {
      preferenceManager._preferenceStorage[testKey] = 'false';
      assert.equal(preferenceManager.getPreference(testKey), false);
    });

    test('undefined would be false', function() {
      preferenceManager._preferenceStorage[testKey] = undefined;
      assert.equal(preferenceManager.getPreference(testKey), false);
    });

    test('othwers would be its original value', function() {
      preferenceManager._preferenceStorage[testKey] = 'test';
      assert.equal(preferenceManager.getPreference(testKey), 'test');
    });
  });
});
