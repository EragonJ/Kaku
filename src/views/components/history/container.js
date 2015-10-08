var React = require('react');
var HistoryManager = require('../../../modules/HistoryManager');
var TracksContainer = require('../shared/tracks-container');

var HistoryContainer = React.createClass({
  getInitialState: function() {
    return {
      tracks: []
    };
  },

  componentDidMount: function() {
    // TODO
    // With DB support, we should make sure stored tracks can be
    // reflected here
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
      playAllButton: true,
      deleteAllButton: true
    };

    return (
      <TracksContainer
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

module.exports = HistoryContainer;
