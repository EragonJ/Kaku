define(function(require) {
  'use strict';

  var React = require('react');

  var PlayAllButton = React.createClass({
    render: function() {
      /* jshint ignore:start */
      return (
        <button className="playall-button">
          <i className="fa fa-fw fa-play-circle"></i>
          Play All
        </button>
      );
      /* jshint ignore:end */
    }
  });

  return PlayAllButton;
});
