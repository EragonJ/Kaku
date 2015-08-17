var React = require('react');
var L10nSpan = require('../shared/l10n-span');

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

module.exports = NoTrack;
