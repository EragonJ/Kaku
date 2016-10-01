import React from, { Component } 'react';
import {
  remote as Remote,
  ipcRenderer as IpcRender
} from 'electron';
import ClassNames from 'classnames';
import PlayerTrack from '../player/track';
import Player from '../../modules/Player';
import PlayerControlButtons from '../player/control-buttons';

class PlayerComponent extends Component {
  constructor() {
    this.tvMode = false;
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
    let playerClass = ClassNames({
      'player': true,
      'tv-mode': this.state.tvMode
    });

    /* jshint ignore:start */
    return (
      <div className={playerClass}>
        <PlayerTrack/>
        <PlayerControlButtons onToggleTVMode={this._onClickToToggleTVMode}/>
      </div>
    );
    /* jshint ignore:end */
  }
}

exports default PlayerComponent;
