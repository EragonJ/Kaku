suite('L10nManager', () => {
  'use strict';
  
  var l10nManager;
  var sandbox;

  setup(() => {
    sandbox = sinon.sandbox.create();
    l10nManager = require('../src/modules/L10nManager');
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
  });

  teardown(() => {
    sandbox.restore();
  });

  suite('changeLanguage()', () => {
    setup(() => {
      l10nManager._currentLanguage = 'zh-TW';
    });

    test('if we want to change to the same language, do nothing', () => {
      l10nManager.changeLanguage('zh-TW');
      assert.isFalse(l10nManager.emit.called);
    });

    test('if we want to change to different language, do change', () => {
      l10nManager.changeLanguage('en')
      assert.isTrue(
        l10nManager.emit.calledWith('language-changed', 'en', 'zh-TW'));
    });
  });

  suite('get()', () => {
    setup(() => {
      l10nManager._currentLanguage = 'zh-TW';
    });

    test('if language is matched, we will directly get result', () => {
      var t = l10nManager.get('fake_1', {});
      assert.equal(t, '假的 1');
    });

    test('if no language is matched, we will fall back to en', () => {
      var t = l10nManager.get('fake_2', {})
      assert.isTrue(console.error.called);
      assert.equal(t, 'fake 2');
    });

    test('even en has no this string, we will return empty string', () => {
      var t = l10nManager.get('no_this_key', {});
      assert.isTrue(console.error.called);
      assert.equal(t, '');
    });
  });
});
