define(function(require) {
  'use strict';

  var React = require('react');

  var NoTrack = React.createClass({
    render: function() {
      /* jshint ignore:start */
      return (
        <div className="notracks">No Tracks</div>
      );
      /* jshint ignore:end */
    }
  });

  return NoTrack;
});
