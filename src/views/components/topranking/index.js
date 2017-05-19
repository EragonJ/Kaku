import React, { Component } from 'react';
import TopRanking from 'kaku-core/modules/TopRanking';
import TracksComponent from '../shared/tracks';
import Player from '../../modules/Player';

class TopRankingComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    };
  }

  componentDidMount() {
    TopRanking.on('topRanking-changed', () => {
      TopRanking.get().then((tracks) => {
        this.setState({
          tracks: tracks
        });
      });
    });

    TopRanking.get().then((tracks) => {
      this.setState({
        tracks: tracks
      });
    });
  }

  _clickToPlayAll() {
    let noUpdate = true;
    Player.cleanupTracks(noUpdate);
    Player.addTracks(this.state.tracks);
    Player.playNextTrack(0);
  }

  render() {
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: false,
      addToPlayQueueButton: true
    };

    return (
      <TracksComponent
        headerL10nId="topranking_header"
        headerIconClass="fa fa-fw fa-line-chart"
        controls={controls}
        tracks={tracks}
        onPlayAllClick={this._clickToPlayAll.bind(this)}
      />
    );
  }
}

module.exports = TopRankingComponent;
