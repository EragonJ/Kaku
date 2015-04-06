define(function(require) {
  'use strict';

  var fs = requireNode('fs');
  var CoreData = require('backend/CoreData');
  var Player = require('models/Player');
  var React = require('react');

  var PlayerControlButtons = React.createClass({
    getInitialState: function() {
      return {
        player: null
      };
    },
      
    componentDidMount: function() {
      this._setupPlayer();
    },

    _onPlayerPlay: function() {
      this._togglePlayIcon();
    },

    _onPlayerPause: function() {
      this._togglePlayIcon();
    },

    _togglePlayIcon: function() {
      var resumeIconDOM = this.refs.resumeIcon.getDOMNode();
      resumeIconDOM.classList.toggle('fa-play');
      resumeIconDOM.classList.toggle('fa-pause');
    },

    _setupPlayer: function() {
      var self = this;
      Player.ready().then(function(player) {
        player.on('play', self._onPlayerPlay);
        player.on('pause', self._onPlayerPause);
        self.setState({
          player: player
        });
      });
    },

    _onBackwardButtonClick: function() {

    },

    _onResumeButtonClick: function() {
      if (this.state.player.paused()) {
        this.state.player.play();
      }
      else {
        this.state.player.pause();
      }
    },

    _onForwardButtonClick: function() {

    },

    _onDownloadButtonClick: function() {

    },

    render: function() {
      return (
        <div className="control-buttons">
          <button className="backward-button" onClick={this._onBackwardButtonClick}>
            <i className="fa fa-step-backward"></i>
          </button>
          <button className="resume-button" onClick={this._onResumeButtonClick}>
            <i className="fa fa-play" ref="resumeIcon"></i>
          </button>
          <button className="forward-button" onClick={this._onForwardButtonClick}>
            <i className="fa fa-step-forward"></i>
          </button>
          <button className="download-button" onClick={this._onDownloadButtonClick}>
            <i className="fa fa-cloud-download"></i>
          </button>
        </div>
      );
    }
  });

  return PlayerControlButtons;
});
