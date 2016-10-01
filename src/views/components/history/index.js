import React, { Component } from 'react';
import HistoryManager from '../../../modules/HistoryManager';
import TracksComponent from '../shared/tracks';

class HistoryComponent extends Component {
  constructor() {
    this.tracks = [];
  },

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
    /* jshint ignore:start */
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: true
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
    /* jshint ignore:end */
  }
}

exports default HistoryComponent;
