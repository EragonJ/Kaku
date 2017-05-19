import React, { Component } from 'react';
import Player from '../../modules/Player';
import TracksComponent from '../shared/tracks';

class PlayQueueComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    };

    this._clickToPlayAll = this._clickToPlayAll.bind(this)
    this._clickToDeleteAll = this._clickToDeleteAll.bind(this)
  }

  componentDidMount() {
    Player.on('tracksUpdated', (tracks) => {
      this.setState({
        tracks: tracks
      });
    });
  }

  _clickToDeleteAll() {
    Player.cleanupTracks();
  }

  _clickToPlayAll() {
    Player.playNextTrack(0);
  }

  render() {
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: true,
      addToPlayQueueButton: false
    };

    return (
      <TracksComponent
        headerL10nId='play_queue_header'
        headerIconClass="fa fa-fw fa-ellipsis-h"
        controls={controls}
        tracks={tracks}
        onPlayAllClick={this._clickToPlayAll}
        onDeleteAllClick={this._clickToDeleteAll}
      />
    );
  }
}

module.exports = PlayQueueComponent;
