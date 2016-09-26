import React, { Component } from 'react';
import TopRanking from 'kaku-core/modules/TopRanking';
import TracksComponent from '../shared/tracks';

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

  render() {
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: false
    };

    /* jshint ignore:start */
    return (
      <TracksComponent
        headerL10nId="topranking_header"
        headerIconClass="fa fa-fw fa-line-chart"
        controls={controls}
        tracks={tracks}
      />
    );
    /* jshint ignore:end */
  }
}

module.exports = TopRankingComponent;
