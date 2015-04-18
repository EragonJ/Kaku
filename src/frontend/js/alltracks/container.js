define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var NoTrack = require('components/no-track');
  var Track = require('components/track');
  var React = require('react');

  var AllTracksContainer = React.createClass({
    getInitialState: function() {
      return {
        tracks: []
      };
    },

    componentDidMount: function() {
      var self = this;
      CoreData.watch('searchResults', function(_1, _2, newValue) {
        var tracks = newValue;
        self.setState({
          tracks: tracks
        });
      });
    },

    render: function() {
      var tracks = this.state.tracks;
      var noTracksDiv;

      if (tracks.length === 0) {
        /* jshint ignore:start */
        noTracksDiv = <NoTrack/>;
        /* jshint ignore:end */
      }

      /* jshint ignore:start */
      return (
        <div className="alltracks-container">
          {noTracksDiv}
          {tracks.map(function(track) {
            return <Track data={track}/>;
          })}
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return AllTracksContainer;
});
