suite('L10nManager', () => {
  'use strict';
  
  var l10nManager;
  var sandbox;

  setup((done) => {
    sandbox = sinon.sandbox.create();

    testRequire([
      'backend/modules/L10nManager'
    ], {}, (L10nManager) => {
      l10nManager = L10nManager;
      l10nManager._cachedStrings = {
        'en': {
          'fake_1': 'fake 1',
          'fake_2': 'fake 2'
        },
        'zh-TW': {
          'fake_1': '假的 1'
        },
      };
      sandbox.stub(console, 'error');
      sandbox.stub(l10nManager, 'emit');
      sinon.stub(l10nManager, '_fetchLanguageFile', () => {
        return Promise.resolve({});
      });
      done();
    });
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('_ready()', () => {
    test('if we already have that language, then directly resolve', (done) => {
      l10nManager._ready('en').then(() => {
        assert.isTrue(true);
      }).then(done, done);
    });

    test('if no that language, then try to fetch it', (done) => {
      l10nManager._ready('unknown_language').then(() => {
        assert.deepEqual(l10nManager._cachedStrings['unknown_language'], {});
        assert.isTrue(l10nManager.emit.calledWith('language-initialized'));
      }).then(done, done);
    });
  });

  suite('changeLanguage()', () => {
    setup(() => {
      l10nManager._currentLanguage = 'zh-TW';
    });

    test('if we want to change to the same language, do nothing', () => {
      l10nManager.changeLanguage('zh-TW');
      assert.isFalse(l10nManager.emit.called);
    });

    test('if we want to change to different language, do change', (done) => {
      l10nManager.changeLanguage('en').then(() => {
        assert.isTrue(
          l10nManager.emit.calledWith('language-changed', 'en', 'zh-TW'));
      }).then(done, done);
    });
  });

  suite('get()', () => {
    setup(() => {
      l10nManager._currentLanguage = 'zh-TW';
    });

    test('if language is matched, we will directly get result', (done) => {
      l10nManager.get('fake_1', {}).then((translatedString) => {
        assert.equal(translatedString, '假的 1');
      }).then(done, done);
    });

    test('if no language is matched, we will fall back to en', (done) => {
      l10nManager.get('fake_2', {}).then((translatedString) => {
        assert.isTrue(console.error.called);
        assert.equal(translatedString, 'fake 2');
      }).then(done, done);
    });

    test('even en has no this string, we will return empty string', (done) => {
      l10nManager.get('no_this_key', {}).then((translatedString) => {
        assert.isTrue(console.error.called);
        assert.equal(translatedString, '');
      }).then(done, done);
    });
  });
});
