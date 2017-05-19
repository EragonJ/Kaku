import React, { Component } from 'react';
import Player from '../../modules/Player';
import HistoryManager from '../../../modules/HistoryManager';
import TracksComponent from '../shared/tracks';

class HistoryComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tracks: []
    };

    this._clickToDeleteAll = this._clickToDeleteAll.bind(this);
  }

  componentWillMount() {
    HistoryManager.ready().then(() => {
      this.setState({
        tracks: HistoryManager.tracks
      });
    });
  }

  componentDidMount() {
    HistoryManager.on('history-updated', (tracks) => {
      this.setState({
        tracks: tracks
      });
    });
  }

  _clickToDeleteAll() {
    HistoryManager.clean();
  }

  render() {
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: false,
      deleteAllButton: true,
      addToPlayQueueButton: false
    };

    return (
      <TracksComponent
        headerL10nId="history_header"
        headerIconClass="fa fa-fw fa-history"
        controls={controls}
        tracks={tracks}
        onDeleteAllClick={this._clickToDeleteAll}
      />
    );
  }
}

module.exports = HistoryComponent;
