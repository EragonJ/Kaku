require('./setup');

suite('Tooltip', () => {
  'use strict';

  var trackComponentSelector = '.topranking-component';
  var firstTrackSelector = trackComponentSelector + ' > .track:first-child';
  var tooltipSelector = '.__react_component_tooltip';

  test('it should show correct tooltip when users hover on it', () => {
    var tooltipText;
    var trackText;

    return Kaku.init()
      .waitForVisible(firstTrackSelector, 5000)
      .moveToObject(firstTrackSelector, 10, 10)
      .waitForText(firstTrackSelector)
      .then((text) => {
        trackText = text;
      })
      .waitForText(tooltipSelector)
      .then((text) => {
        tooltipText = text;
        assert.equal(trackText, tooltipText);
      })
      .end();
  });
});
