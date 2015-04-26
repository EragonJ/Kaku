define(function(require) {
  'use strict';

  var React = require('react');
  var TrackInfoFetcher = require('backend/TrackInfoFetcher');
  var TopRanking = require('backend/TopRanking');
  var Track = require('components/shared/track');

  var TopRankingContainer = React.createClass({
    getInitialState: function() {
      return {
        tracks: []
      };
    },

    componentDidMount: function() {
      TopRanking.get().then((tracks) => {
        this.setState({
          tracks: tracks
        });
      });
    },

    render: function() {
      var tracks = this.state.tracks;

      /* jshint ignore:start */
      return (
        <div className="topranking-slot">
          <h1><i className="fa fa-fw fa-line-chart"></i>Top Rankings</h1>
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

  return TopRankingContainer;
});
