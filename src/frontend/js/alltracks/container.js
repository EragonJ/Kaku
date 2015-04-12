define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
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
        noTracksDiv = <div className="notracks">No Tracks</div>
      }

      return (
        <div className="alltracks-container">
          {noTracksDiv}
          {tracks.map(function(track) {
            return <Track data={track}/>;
          })}
        </div>
      );
    }
  });

  return AllTracksContainer;
});
