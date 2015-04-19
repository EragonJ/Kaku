define(function(require) {
  'use strict';

  var React = require('react');
  var PlaylistManager = require('backend/PlaylistManager');
  var NoTrack = require('components/no-track');
  var Track = require('components/track');

  var PlaylistContainer = React.createClass({
    getInitialState: function() {
      return {
        playlistId: '',
        tracks: []
      };
    },

    componentDidMount: function() {
      PlaylistManager.on('shown', (playlist) => {
        this.state.set({
          playlistId: playlist.id,
          tracks: playlist.tracks
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
        <div className="playlist-container">
          {noTracksDiv}
          {tracks.map(function(track) {
            return <Track data={track}/>;
          })}
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return PlaylistContainer;
});
