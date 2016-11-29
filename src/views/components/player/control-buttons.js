var Electron = require('electron');
var Shell = Electron.shell;
var React = require('react');
var Player = require('../../modules/Player');
var L10nSpan = require('../shared/l10n-span');
var Notifier = require('../../modules/Notifier');
var Dialog = require('../../modules/Dialog');
var CastingManager = require('../../modules/CastingManager');
var L10nManager = require('../../../modules/L10nManager');
var ClassNames = require('classnames');
var _ = L10nManager.get.bind(L10nManager);

var PlayerControlButtons = React.createClass({
  propTypes: {
    onToggleTVMode: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      playerMode: Player.mode,
      isCasting: false,
      isConnecting: false
    };
  },

  getDefaultProps: function() {
    return {
      onToggleTVMode: function() {}
    };
  },

  componentDidMount: function() {
    Player.on('modeUpdated', (mode) => {
      this.setState({
        playerMode: mode
      });
    });

    Player.on('play', () => {
      this._updatePlayIconState('play');
    });

    Player.on('pause', () => {
      this._updatePlayIconState('pause');
    });

    CastingManager.on('error', (error) => {
      this.setState({
        isCasting: false,
        isConnecting: false
      });
    });

    CastingManager.on('connected', () => {
      this.setState({
        isCasting: true,
        isConnecting: false
      });
    });

    CastingManager.on('connecting', () => {
      this.setState({
        isConnecting: true,
        isCasting: false
      });
    });
  },

  _updatePlayIconState: function(state) {
    var resumeIconDOM = this.refs.resumeIcon;
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

  _onCastToDeviceButtonClick: function() {
    if (!this.state.isCasting) {
      let services = CastingManager.services.values();
      let topService = services.next().value;
      if (topService) {
        Dialog.confirm(_('player_to_cast_prompt', {
          name: topService.name
        }), (sure) => {
          if (sure) {
            CastingManager.connect(topService.address);
          }
        });
      }
      else {
        Notifier.alert(_('player_no_device_found_alert'));
      }
    }
    else {
      CastingManager.close();
    }
  },

  _onTVButtonClick: function() {
    this.props.onToggleTVMode();
  },

  _onRepeatButtonClick: function() {
    Player.ready().then((player) => {
      Player.changeMode();
    });
  },

  render: function() {
    var playerMode = this.state.playerMode;
    var l10nIdForRepeat = 'player_repeat_' + playerMode;
    var playerRepeatWording = '';

    // TODO
    // add a translation here later
    switch (playerMode) {
      case 'no':
        playerRepeatWording = 'x';
        break;
      case 'one':
        playerRepeatWording = '1';
        break;
      case 'all':
        playerRepeatWording = 'All';
        break;
      case 'random':
        playerRepeatWording = '?';
        break;
    }

    var castButtonClass = ClassNames({
      'cast-button': true,
      'btn': true,
      'is-casting': this.state.isCasting,
      'is-connecting': this.state.isConnecting
    });

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
          l10nId="player_cast_to_device"
          className={castButtonClass}
          onClick={this._onCastToDeviceButtonClick}
          where="title">
            <img src="src/public/images/others/cast.png"/>
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
