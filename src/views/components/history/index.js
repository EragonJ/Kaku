import React from 'react';
import Player from '../../modules/Player';
import HistoryManager from '../../../modules/HistoryManager';
import TracksComponent from '../shared/tracks';

var HistoryComponent = React.createClass({
  getInitialState: function() {
    return {
      tracks: []
    };
  },

  componentWillMount: function() {
    HistoryManager.ready().then(() => {
      this.setState({
        tracks: HistoryManager.tracks
      });
    });
  },

  componentDidMount: function() {
    HistoryManager.on('history-updated', (tracks) => {
      this.setState({
        tracks: tracks
      });
    });
  },

  _clickToDeleteAll: function() {
    HistoryManager.clean();
  },

  render: function() {
    /* jshint ignore:start */
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
    /* jshint ignore:end */
  }
});

module.exports = HistoryComponent;
