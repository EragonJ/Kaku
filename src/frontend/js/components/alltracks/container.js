define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var NoTrack = require('components/shared/no-track');
  var Track = require('components/shared/track');
  var React = require('react');

  var AllTracksContainer = React.createClass({
    getInitialState: function() {
      return {
        tracks: []
      };
    },

    componentDidMount: function() {
      CoreData.watch('searchResults', (_1, _2, newValue) => {
        var tracks = newValue;
        this.setState({
          tracks: tracks
        });
      });
    },

    render: function() {
      /* jshint ignore:start */
      var tracks = this.state.tracks;
      var noTracksDiv;

      if (tracks.length === 0) {
        noTracksDiv = <NoTrack/>;
      }

      return (
        <div className="alltracks-slot">
          <h1><i className="fa fa-fw fa-search"></i>Search Results</h1>
          <div className="alltracks-container">
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

  return AllTracksContainer;
});
