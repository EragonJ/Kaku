var Shell = require('shell');
var React = require('react');

var L10nSpan = require('../shared/l10n-span');

var Notifier = require('../../modules/Notifier');
var Player = require('../../modules/Player');

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
      Shell.openExternal(track.platformTrackUrl);
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
          l10nId="player_show_lyrics"
          className="lyric-button btn"
          onClick={this._onLyricButtonClick}
          where="title"
          disabled>
            <i className="fa fa-fw fa-font"></i>
        </L10nSpan>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = PlayerControlButtons;
