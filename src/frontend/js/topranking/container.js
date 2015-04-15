define(function(require) {
  'use strict';

  var React = require('react');
  var TopRanking = require('backend/TopRanking');
  var Track = require('components/track');

  var TopRankingContainer = React.createClass({
    getInitialState: function() {
      return {
        tracks: []
      };
    },

    componentDidMount: function() {
      var self = this;
      TopRanking.get().then(function(tracks) {
        self.setState({
          tracks: tracks
        });
      });
    },

    render: function() {
      var tracks = this.state.tracks;

      /* jshint ignore:start */
      return (
        <div className="topranking-container clearfix">
          {tracks.map(function(track) {
            return <Track data={track}/>;
          })}
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return TopRankingContainer;
});
