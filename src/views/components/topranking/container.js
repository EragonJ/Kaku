var React = require('react');
var TopRanking = require('kaku-core/modules/TopRanking');
var TracksContainer = require('../shared/tracks-container');

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

  render: function() {
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: false
    };

    /* jshint ignore:start */
    return (
      <TracksContainer
        headerL10nId="topranking_header"
        headerIconClass="fa fa-fw fa-line-chart"
        controls={controls}
        tracks={tracks}
      />
    );
    /* jshint ignore:end */
  }
});

module.exports = TopRankingContainer;
