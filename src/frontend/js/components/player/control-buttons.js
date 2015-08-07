define(function(require) {
  'use strict';

  var shell = requireNode('shell');
  var crypto = requireNode('crypto');

  var React = require('react');
  var Player = require('modules/Player');
  var Notifier = require('modules/Notifier');

  var PlayerControlButtons = React.createClass({
    getInitialState: function() {
      return {
        playerRepeatMode: 'no',
        player: null
      };
    },

    componentDidMount: function() {
      Player.on('repeatModeUpdated', (mode) => {
        this.setState({
          playerRepeatMode: mode
        });
      });

      this._setupPlayer();
    },

    _repeatModeIndex: 0,

    _repeatModes: ['no', 'one', 'all'],

    _onPlayerPlay: function() {
      this._togglePlayIcon();
    },

    _onPlayerPause: function() {
      this._togglePlayIcon();
    },

    _updatePlayIconState: function(state) {
      var resumeIconDOM = this.refs.resumeIcon.getDOMNode();
      if (state === 'play') {
        // show pause button
        resumeIconDOM.classList.remove('fa-play');
        resumeIconDOM.classList.add('fa-pause');
      }
      else {
        // show play button
        resumeIconDOM.classList.add('fa-play');
        resumeIconDOM.classList.remove('fa-pause');
      }
    },

    _setupPlayer: function() {
      Player.ready().then((player) => {
        player.on('play', () => {
          this._updatePlayIconState('play');
        });

        player.on('pause', () => {
          this._updatePlayIconState('pause');
        });

        this.setState({
          player: player
        });
      });
    },

    _onBackwardButtonClick: function() {
      Player.playPreviousTrack();
    },

    _onForwardButtonClick: function() {
      Player.playNextTrack();
    },

    _onResumeButtonClick: function() {
      Player.ready().then(() => {
        if (this.state.player.paused()) {
          this.state.player.play();
        }
        else {
          this.state.player.pause();
        }
      });
    },

    _onExternalButtonClick: function() {
      var track = Player.playingTrack;
      if (track) {
        shell.openExternal(track.platformTrackUrl);
      }
    },

    _onLyricButtonClick: function() {

    },

    _onRepeatButtonClick: function() {
      Player.ready().then((player) => {
        this._repeatModeIndex =
          (this._repeatModeIndex + 1) % this._repeatModes.length;
        var selectedRepeatMode = this._repeatModes[this._repeatModeIndex];
        Player.repeatMode = selectedRepeatMode;
      });
    },

    render: function() {
      var playerRepeatMode = this.state.playerRepeatMode;
      var playerRepeatWording = '';
      var playerRepeatHint = '';

      // TODO
      // add a translation here later
      switch (playerRepeatMode) {
        case 'no':
          playerRepeatWording = 'x';
          playerRepeatHint = 'No Repeat';
          break;
        case 'one':
          playerRepeatWording = '1';
          playerRepeatHint = 'Repeat current track';
          break;
        case 'all':
          playerRepeatWording = 'All';
          playerRepeatHint = 'Repeat all tracks';
          break;
      }

      /* jshint ignore:start */
      return (
        <div className="control-buttons">
          <button
            className="backward-button"
            onClick={this._onBackwardButtonClick}
            title="Play Previuos Track">
              <i className="fa fa-fw fa-step-backward"></i>
          </button>
          <button
            className="resume-button"
            onClick={this._onResumeButtonClick}
            title="Play / Pause">
              <i className="fa fa-fw fa-play" ref="resumeIcon"></i>
          </button>
          <button
            className="forward-button"
            onClick={this._onForwardButtonClick}
            title="Play Next Track">
              <i className="fa fa-fw fa-step-forward"></i>
          </button>
          <button
            className="repeat-button"
            onClick={this._onRepeatButtonClick}
            title={playerRepeatHint}>
              <i className="fa fa-fw fa-repeat"></i>
              <span className="mode">{playerRepeatWording}</span>
          </button>
          <button
            className="external-button"
            onClick={this._onExternalButtonClick}
            title="Open in browser">
              <i className="fa fa-fw fa-external-link"></i>
          </button>
          <button
            className="lyric-button"
            onClick={this._onLyricButtonClick}
            title="Show Lyrics"
            disabled>
              <i className="fa fa-fw fa-font"></i>
          </button>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return PlayerControlButtons;
});
