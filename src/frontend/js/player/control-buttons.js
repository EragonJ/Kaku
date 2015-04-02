define(function(require) {

  var React = require('react');

  var PlayerControlButtons = React.createClass({
    playBackward: function() {

    },
    playResume: function() {

    },
    playForward: function() {

    },
    render: function() {
      return (
        <div className="control-buttons">
          <button className="play-backward-button" onClick={this.playBackward}>
            <i className="fa fa-step-backward"></i>
          </button>
          <button className="play-resume-button" onClick={this.playResume}>
            <i className="fa fa-play"></i>
          </button>
          <button className="play-forward-button" onClick={this.playForward}>
            <i className="fa fa-step-forward"></i>
          </button>
        </div>
      );
    }
  });

  return PlayerControlButtons;
});
