define(function(require) {
  'use strict';

  var React = require('react');

  var L10nSpan = require('components/shared/l10n-span');

  var NoTrack = React.createClass({
    render: function() {
      /* jshint ignore:start */
      return (
        <div className="notracks">
          <L10nSpan l10nId="component_no_track"/>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return NoTrack;
});
