import React, { Component } from 'react';
import Player from '../../modules/Player';

class PlayerTrack extends Component {
  constructor(props) {
    super(props);

    this._onPlayerPlay = this._onPlayerPlay.bind(this);
    this._onPlayerPause = this._onPlayerPause.bind(this);
    this._onPlayerProgress = this._onPlayerProgress.bind(this);
    this._setupPlayer = this._setupPlayer.bind(this);
  }

  componentDidMount() {
    this._setupPlayer();
  }

  _onPlayerPlay() {

  }

  _onPlayerPause() {

  }

  _onPlayerProgress() {

  }

  _setupPlayer() {
    let playerDOM = document.createElement('video');
    playerDOM.id = 'player';
    playerDOM.classList.add('video-js');
    playerDOM.classList.add('vjs-default-skin');
    this.refs.playerComponent.appendChild(playerDOM);

    Player.setPlayer(playerDOM);
    Player.on('play', this._onPlayerPlay);
    Player.on('pause', this._onPlayerPause);
    Player.on('progress', this._onPlayerProgress);
  }

  render() {
    return (
      <div
        className="playerComponent vjs-default-skin"
        ref="playerComponent">
      </div>
    );
  }
}

module.exports = PlayerTrack;
