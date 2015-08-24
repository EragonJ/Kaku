var React = require('react');

var TrackInfoFetcher = require('../../../modules/TrackInfoFetcher');
var TopRanking = require('../../../modules/TopRanking');

var PlayAllButton = require('../shared/playall-button');
var L10nSpan = require('../shared/l10n-span');
var Track = require('../shared/track');

var TopRankingContainer = React.createClass({
  getInitialState: function() {
    return {
      tracks: []
    };
  },

  componentDidMount: function() {
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
  },

  componentDidUpdate: function() {
    window.dispatchEvent(new Event('rebind-tooltip'));
  },

  render: function() {
    var tracks = this.state.tracks;

    /* jshint ignore:start */
    return (
      <div className="topranking-slot">
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-line-chart"></i>
            <L10nSpan l10nId="topranking_header"/>
          </h1>
          <div className="control-buttons">
            <PlayAllButton data={tracks}/>
          </div>
        </div>
        <div className="topranking-container clearfix">
          {tracks.map((track) => {
            return <Track data={track}/>;
          })}
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = TopRankingContainer;
