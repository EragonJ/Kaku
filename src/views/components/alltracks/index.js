import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import Searcher from '../../../modules/Searcher';
import TracksComponent from '../shared/tracks';
import Player from '../../modules/Player';

class AllTracksComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    };

    this._clickToPlayAll = this._clickToPlayAll.bind(this);
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
        headerL10nId="search_header"
        headerIconClass="fa fa-fw fa-search"
        controls={controls}
        tracks={tracks}
        onPlayAllClick={this._clickToPlayAll}
      />
    );
  }
}

module.exports = AllTracksComponent;
