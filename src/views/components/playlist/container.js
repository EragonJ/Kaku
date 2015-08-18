var React = require('react');
var PlaylistManager = require('../../../modules/PlaylistManager');
var TabManager = require('../../modules/TabManager');

var PlayAllButton = require('../shared/playall-button');
var NoTrack = require('../shared/no-track');
var Track = require('../shared/track');

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

module.exports = PlaylistContainer;
