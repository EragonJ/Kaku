define(function(require) {
  'use strict';

  var React = require('react');
  var PlaylistManager = require('backend/PlaylistManager');
  var TabManager = require('modules/TabManager');
  var NoTrack = require('components/shared/no-track');
  var Track = require('components/shared/track');

  var PlaylistContainer = React.createClass({
    getInitialState: function() {
      return {
        playlistId: '',
        tracks: []
      };
    },

    componentDidMount: function() {
      TabManager.on('changed', (tabName, tabOptions) => {
        if (tabName === 'playlist') {
          var playlistId = tabOptions;
          PlaylistManager.displayPlaylist(playlistId);
        }
      });

      // TODO
      // we should make sure when playlist is changed,
      // this event listeners would be removed
      PlaylistManager.on('shown', (playlist) => {
        this.setState({
          playlistId: playlist.id,
          tracks: playlist.tracks
        });

        playlist.on('tracksUpdated', () => {
          this.setState({
            tracks: playlist.tracks
          });
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
