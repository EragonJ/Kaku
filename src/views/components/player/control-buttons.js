import Electron from 'electron';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Player from '../../modules/Player';
import L10nSpan from '../shared/l10n-span';
import Notifier from '../../modules/Notifier';
import Dialog from '../../modules/Dialog';
import CastingManager from '../../modules/CastingManager';
import L10nManager from '../../../modules/L10nManager';
import ClassNames from 'classnames';

const Shell = Electron.shell;
const _ = L10nManager.get.bind(L10nManager);

class PlayerControlButtons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playerMode: Player.mode,
      isCasting: false,
      isConnecting: false
    };

    this._updatePlayIconState = this._updatePlayIconState.bind(this);
    this._onBackwardButtonClick = this._onBackwardButtonClick.bind(this);
    this._onForwardButtonClick = this._onForwardButtonClick.bind(this);
    this._onResumeButtonClick = this._onResumeButtonClick.bind(this);
    this._onExternalButtonClick = this._onExternalButtonClick.bind(this);
    this._onCastToDeviceButtonClick = this._onCastToDeviceButtonClick.bind(this);
    this._onTVButtonClick = this._onTVButtonClick.bind(this);
    this._onRepeatButtonClick = this._onRepeatButtonClick.bind(this);
  }

  componentDidMount() {
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
  }

  _updatePlayIconState(state) {
    let resumeIconDOM = this.refs.resumeIcon;
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
  }

  _onBackwardButtonClick() {
    Player.playPreviousTrack();
  }

  _onForwardButtonClick() {
    Player.playNextTrack();
  }

  _onResumeButtonClick() {
    Player.ready().then((internalPlayer) => {
      if (internalPlayer.paused()) {
        Player.play();
      }
      else {
        Player.pause();
      }
    });
  }

  _onExternalButtonClick() {
    let track = Player.playingTrack;
    if (track) {
      Shell.openExternal(track.platformTrackUrl);
    }
  }

  _onCastToDeviceButtonClick() {
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
  }

  _onTVButtonClick() {
    this.props.onToggleTVMode();
  }

  _onRepeatButtonClick() {
    Player.ready().then((player) => {
      Player.changeMode();
    });
  }

  render() {
    let playerMode = this.state.playerMode;
    let l10nIdForRepeat = `player_repeat_${playerMode}`;
    let playerRepeatWording = '';

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

    const castButtonClass = ClassNames({
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
}

PlayerControlButtons.propTypes = {
  onToggleTVMode: PropTypes.func
};

PlayerControlButtons.defaultProps = {
  onToggleTVMode: function() {}
};

module.exports = PlayerControlButtons;
