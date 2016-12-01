import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import Searcher from '../../../modules/Searcher';
import TracksComponent from '../shared/tracks';

class AllTracksComponent extends Component {
  constructor() {
    super();

    this.state = {
      tracks: []
    };
  }

  componentDidMount() {
    Searcher.on('search-results-updated', (results) => {
      this.setState({
        tracks: results
      });
    });
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
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
        headerL10nId="search_header"
        headerIconClass="fa fa-fw fa-search"
        controls={controls}
        tracks={tracks}
      />
    );
  }
}

module.exports = AllTracksComponent;
