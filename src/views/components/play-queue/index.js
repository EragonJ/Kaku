import React, { Component } from 'react';
import Player from '../../modules/Player';
import TracksComponent from '../shared/tracks';

class PlayQueueComponent extends Component {
  constructor() {
    super();

    this.state = {
      tracks: []
    };
  }

  componentWillMount() {
    Player.ready().then(() => {
      this.setState({
        tracks: Player.tracks
      });
    });
  }

  componentDidMount() {
    Player.on('tracksUpdated', (tracks) => {
      this.setState({
        tracks: tracks
      });
    });
  }

  render() {
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true
    };

    return (
      <TracksComponent
        headerL10nId='play_queue_header'
        headerIconClass="fa fa-fw fa-ellipsis-h"
        controls={controls}
        tracks={tracks}
      />
    );
  }
}

module.exports = PlayQueueComponent;
