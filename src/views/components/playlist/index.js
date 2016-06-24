var React = require('react');
var TabManager = require('../../modules/TabManager');
var PlaylistManager = require('../../../modules/PlaylistManager');

var TracksComponent = require('../shared/tracks');
var PlaylistComponent = React.createClass({
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
        PlaylistManager.showPlaylistById(playlist.id);
      }
      else {
        // we should clean the internal state of activePlaylist
        PlaylistManager.hidePlaylist();
      }
    });

    PlaylistManager.on('shown', (playlist) => {
      this._boundUpdateInternalPlaylist =
        this._updateInternalPlaylist.bind(this, playlist);

      this.setState({
        playlist: playlist,
        tracks: playlist.tracks
      });

      playlist.removeListener('tracksUpdated',
        this._boundUpdateInternalPlaylist);
      playlist.on('tracksUpdated', this._boundUpdateInternalPlaylist);
    });

    PlaylistManager.on('renamed', (playlist) => {
      if (playlist.id === this.state.playlist.id) {
        this._updateInternalPlaylist(playlist);
      }
    });
  },

  _updateInternalPlaylist: function(playlist) {
    this.setState({
      playlist: playlist
    });
  },

  render: function() {
    let playlistName = this.state.playlist.name || '';
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: false
    };

    /* jshint ignore:start */
    return (
      <TracksComponent
        headerWording={playlistName}
        headerIconClass="fa fa-fw fa-music"
        controls={controls}
        tracks={tracks}
      />
    );
    /* jshint ignore:end */
  }
});

module.exports = PlaylistComponent;
