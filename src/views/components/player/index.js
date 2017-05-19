import React, { Component } from 'react';
import Electron from 'electron';
import ClassNames from 'classnames';
import PlayerTrack from '../player/track';
import Player from '../../modules/Player';
import PlayerControlButtons from '../player/control-buttons';

const Remote = Electron.remote;
const IpcRender = Electron.ipcRenderer;

class PlayerComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tvMode: false
    };

    this._onClickToToggleTVMode = this._onClickToToggleTVMode.bind(this);
  }

  _onClickToToggleTVMode() {
    // Note : this is not the same with fullscreen !
    this.setState({
      tvMode: !this.state.tvMode
    });
  }

  componentDidMount() {
    IpcRender.on('key-Escape', () => {
      if (this.state.tvMode) {
        this.setState({
          tvMode: false
        });
      }
    });

    // This is important because we use some CSS hack in TV mode and this
    // will influence the control bar in fullscreen, so we need to change
    // it back to normal mode to make sure the UI looks good !
    Player.on('fullscreenchange', () => {
      this.setState({
        tvMode: false
      });
    });
  }

  render() {
    const playerClass = ClassNames({
      'player': true,
      'tv-mode': this.state.tvMode
    });

    return (
      <div className={playerClass}>
        <PlayerTrack/>
        <PlayerControlButtons onToggleTVMode={this._onClickToToggleTVMode}/>
      </div>
    );
  }
}

module.exports = PlayerComponent;
