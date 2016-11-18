import React, { Component } from 'react';
import Player from '../../modules/Player';

class PlayerTrack extends Component {
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
    /* jshint ignore:start */
    return (
      <div
        className="playerComponent vjs-default-skin"
        ref="playerComponent">
      </div>
    );
    /* jshint ignore:end */
  }
}

exports default PlayerTrack;
