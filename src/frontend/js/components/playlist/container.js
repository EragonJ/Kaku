define(function(require) {
  'use strict';

  var React = require('react');
  var PlayAllButton = require('components/shared/playall-button');
  var PlaylistManager = require('backend/PlaylistManager');
  var NoTrack = require('components/shared/no-track');
  var Track = require('components/shared/track');
  var TabManager = require('modules/TabManager');

  var PlaylistContainer = React.createClass({
    getInitialState: function() {
      return {
        playlist: {},
        tracks: []
      };
    },

    componentDidMount: function() {
      TabManager.on('changed', (tabName, tabOptions) => {
        if (tabName === 'playlist') {
          var playlistId = tabOptions;
          var playlist = PlaylistManager.findPlaylistById(playlistId);
          PlaylistManager.displayPlaylistById(playlist.id);
        }
      });

      PlaylistManager.on('shown', (playlist) => {
        this.setState({
          playlist: playlist,
          tracks: playlist.tracks
        });

        playlist.removeAllListeners('tracksUpdated');
        playlist.on('tracksUpdated', () => {
          this.setState({
            tracks: playlist.tracks
          });
        });
      });

      PlaylistManager.on('renamed', (playlist) => {
        if (playlist.id === this.state.playlist.id) {
          this.setState({
            playlist: playlist
          });
        }
      });
    },

    render: function() {
      /* jshint ignore:start */
      var playlistName = this.state.playlist.name || '';
      var tracks = this.state.tracks;
      var noTracksDiv;

      if (tracks.length === 0) {
        noTracksDiv = <NoTrack/>;
      }

      return (
        <div className="playlist-slot">
          <div className="header clearfix">
            <h1><i className="fa fa-fw fa-music"></i>{playlistName}</h1>
            <div className="control-buttons">
              <PlayAllButton data={tracks}/>
            </div>
          </div>
          <div className="playlist-container">
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

  return PlaylistContainer;
});
