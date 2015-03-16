define(function(require) {

  var React = require('react');
  var PlayerControlButtons = require('components/player/control-buttons');
  var PlayerTrack = require('components/player/track');

  var PlayerContainer = React.createClass({
    render: function() {
      return (
        <div className="player-container">
          <PlayerTrack/>
          <PlayerControlButtons/>
        </div>
      );
    }
  });

  return <PlayerContainer/>;
});
