define(function(require) {
  'use strict';

  var React = require('react');
  var PlayerControlButtons = require('player/control-buttons');
  var PlayerTrack = require('player/track');

  var PlayerContainer = React.createClass({
    render: function() {
      /* jshint ignore:start */
      return (
        <div className="player">
          <PlayerTrack/>
          <PlayerControlButtons/>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return PlayerContainer;
});
