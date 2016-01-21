var Shell = require('shell');
var React = require('react');
var Player = require('../../modules/Player');
var L10nSpan = require('../shared/l10n-span');
var Notifier = require('../../modules/Notifier');

var PlayerControlButtons = React.createClass({
  propTypes: {
    onToggleTVMode: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      playerRepeatMode: 'no'
    };
  },

  getDefaultProps: function() {
    return {
      onToggleTVMode: function() {}
    };
  },

  componentDidMount: function() {
    Player.on('repeatModeUpdated', (mode) => {
      this.setState({
        playerRepeatMode: mode
      });
    });

    Player.on('play', () => {
      this._updatePlayIconState('play');
    });

    Player.on('pause', () => {
      this._updatePlayIconState('pause');
    });
  },

  _repeatModeIndex: 0,

  _repeatModes: ['no', 'one', 'all'],

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

  _onBackwardButtonClick: function() {
    Player.playPreviousTrack();
  },

  _onForwardButtonClick: function() {
    Player.playNextTrack();
  },

  _onResumeButtonClick: function() {
    Player.ready().then((internalPlayer) => {
      if (internalPlayer.paused()) {
        Player.play();
      }
      else {
        Player.pause();
      }
    });
  },

  _onExternalButtonClick: function() {
    var track = Player.playingTrack;
    if (track) {
      Shell.openExternal(track.platformTrackUrl);
    }
  },

  _onTVButtonClick: function() {
    this.props.onToggleTVMode();
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
    var l10nIdForRepeat = 'player_repeat_' + playerRepeatMode;
    var playerRepeatWording = '';

    // TODO
    // add a translation here later
    switch (playerRepeatMode) {
      case 'no':
        playerRepeatWording = 'x';
        break;
      case 'one':
        playerRepeatWording = '1';
        break;
      case 'all':
        playerRepeatWording = 'All';
        break;
    }

    /* jshint ignore:start */
    return (
      <div className="control-buttons">
        <L10nSpan
          l10nId="player_play_previous_track"
          className="backward-button btn"
          onClick={this._onBackwardButtonClick}
          where="title">
            <i className="fa fa-fw fa-step-backward"></i>
        </L10nSpan>
        <L10nSpan
          l10nId="player_play_or_pause_track"
          className="resume-button btn"
          onClick={this._onResumeButtonClick}
          where="title">
            <i className="fa fa-fw fa-play" ref="resumeIcon"></i>
        </L10nSpan>
        <L10nSpan
          l10nId="player_play_next_track"
          className="forward-button btn"
          onClick={this._onForwardButtonClick}
          where="title">
            <i className="fa fa-fw fa-step-forward"></i>
        </L10nSpan>
        <L10nSpan
          l10nId={l10nIdForRepeat}
          className="repeat-button btn"
          onClick={this._onRepeatButtonClick}
          where="title">
            <i className="fa fa-fw fa-repeat"></i>
            <span className="mode">{playerRepeatWording}</span>
        </L10nSpan>
        <L10nSpan
          l10nId="player_open_in_browser"
          className="external-button btn"
          onClick={this._onExternalButtonClick}
          where="title">
            <i className="fa fa-fw fa-external-link"></i>
        </L10nSpan>
        <L10nSpan
          l10nId="player_toggle_tv_mode"
          className="tv-button btn"
          onClick={this._onTVButtonClick}
          where="title">
            <i className="fa fa-fw fa-television"></i>
        </L10nSpan>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = PlayerControlButtons;
