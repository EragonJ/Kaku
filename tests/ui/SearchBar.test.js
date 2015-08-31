require('./setup');

suite('Searchbar', () => {
  'use strict';

  var searchbarSelector = '.searchbar-user-input';
  test('it does find tracks when typing', () => {
    return Kaku.init().setValue(searchbarSelector, 'test')
      .waitForVisible('.autocomplete-list')
      .then((visible) => {
        assert.ok(visible);
      })
      .end();
  });
});
