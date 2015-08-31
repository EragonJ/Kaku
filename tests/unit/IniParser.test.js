suite('IniParser', () => {
  'use strict';

  var iniParser;

  setup(() => {
    iniParser = require('../../src/modules/IniParser');
  });

  suite('parse() >', () => {
    test('will find out strings with x=y format', () => {
      var result = iniParser.parse("a=1\r\nb=2\r\nc=3");
      assert.deepEqual(result, {
        a: '1',
        b: '2',
        c: '3'
      });
    });

    test('will find out strings even if there is one empty line', () => {
      var result = iniParser.parse("a=1\r\n\r\nc=3");
      assert.deepEqual(result, {
        a: '1',
        c: '3'
      });
    });

    test('will find out strings even if there are space inside', () => {
      var result = iniParser.parse("a=  1\r\n   \r\n  c =  3");
      assert.deepEqual(result, {
        a: '1',
        c: '3'
      });
    });

    test('will find out strings even if there are "" inside', () => {
      var result = iniParser.parse("a=\"1\"\r\n   \r\n  c =  3");
      assert.deepEqual(result, {
        a: '1',
        c: '3'
      });
    });

    test('will ignore lines which start with #', () => {
      var result = iniParser.parse("a=1\r\n#b=2\r\nc=3");
      assert.deepEqual(result, {
        a: '1',
        c: '3'
      });
    });

    test('will ignore lines which start with ;', () => {
      var result = iniParser.parse("a=1\r\n;b=2\r\nc=3");
      assert.deepEqual(result, {
        a: '1',
        c: '3'
      });
    });
  });
});
