var React = require('react');
var ReactTooltip = require('react-tooltip');

var HistoryManager = require('../../../modules/HistoryManager');
var PlayAllButton = require('../shared/playall-button');
var NoTrack = require('../shared/no-track');
var Track = require('../shared/track');
var L10nSpan = require('../shared/l10n-span');

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

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  _clickToCleanAll: function() {
    HistoryManager.clean();
  },

  render: function() {
    /* jshint ignore:start */
    var tracks = this.state.tracks;
    var isCleanButtonDisabled = (tracks.length === 0);
    var noTracksDiv;

    if (tracks.length === 0) {
      noTracksDiv = <NoTrack/>;
    }

    return (
      <div className="histories-slot">
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-history"></i>
            <L10nSpan l10nId="history_header"/>
          </h1>
          <div className="control-buttons">
            <button
              className="clean-button"
              onClick={this._clickToCleanAll}
              disabled={isCleanButtonDisabled}>
                <i className="fa fa-fw fa-trash-o"></i>
                <L10nSpan l10nId="history_clean_all"/>
            </button>
            <PlayAllButton data={tracks}/>
          </div>
        </div>
        <div className="history-container">
          {noTracksDiv}
          {tracks.map(function(track) {
            return <Track data={track}/>;
          })}
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = HistoryContainer;
