define(function(require) {
  'use strict';

  var fs = requireNode('fs');
  var CoreData = require('backend/CoreData');
  var Player = require('modules/Player');
  var React = require('react');

  var PlayerControlButtons = React.createClass({
    getInitialState: function() {
      return {
        player: null,
        isRepeating: false
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
      var self = this;
      Player.ready().then(function(player) {
        if (self.state.player.paused()) {
          self.state.player.play();
        }
        else {
          self.state.player.pause();
        }
      });
    },

    _onForwardButtonClick: function() {

    },

    _onDownloadButtonClick: function() {

    },

    _onInfoButtonClick: function() {

    },

    _onLyricButtonClick: function() {

    },

    _onRepeatButtonClick: function() {
      var self = this;
      Player.ready().then(function(player) {
        // TODO
        // change to different icon here
        var repeatIconDOM = self.refs.repeatIcon.getDOMNode();
        repeatIconDOM.classList.toggle('fa-repeat');
        repeatIconDOM.classList.toggle('fa-times');

        var isRepeating = self.state.isRepeating;
        player.loop(!isRepeating);
      });
    },

    render: function() {
      return (
        <div className="control-buttons">
          <button className="backward-button" onClick={this._onBackwardButtonClick}>
            <i className="fa fa-fw fa-step-backward"></i>
          </button>
          <button className="resume-button" onClick={this._onResumeButtonClick}>
            <i className="fa fa-fw fa-play" ref="resumeIcon"></i>
          </button>
          <button className="forward-button" onClick={this._onForwardButtonClick}>
            <i className="fa fa-fw fa-step-forward"></i>
          </button>
          <button className="repeat-button" onClick={this._onRepeatButtonClick}>
            <i className="fa fa-fw fa-repeat" ref="repeatIcon"></i>
          </button>
          <button className="download-button" onClick={this._onDownloadButtonClick}>
            <i className="fa fa-fw fa-cloud-download"></i>
          </button>
          <button className="info-button" onClick={this._onInfoButtonClick}>
            <i className="fa fa-fw fa-info"></i>
          </button>
          <button className="lyric-button" onClick={this._onLyricButtonClick}>
            <i className="fa fa-fw fa-font"></i>
          </button>
        </div>
      );
    }
  });

  return PlayerControlButtons;
});
