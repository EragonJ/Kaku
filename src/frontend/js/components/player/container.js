define(function(require) {
  'use strict';

  var React = require('react');
  var PlayerControlButtons = require('components/player/control-buttons');
  var PlayerTrack = require('components/player/track');

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
