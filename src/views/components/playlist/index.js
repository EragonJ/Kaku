import React, { Component } from 'react';
import TabManager from '../../modules/TabManager';
import Player from '../../modules/Player';
import PlaylistManager from '../../../modules/PlaylistManager';
import TracksComponent from '../shared/tracks';

class PlaylistComponent extends Component {
  constructor() {
    super();

    this.state = {
      playlist: {},
      tracks: []
    };
  }

  componentDidMount() {
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
  }

  _updateInternalPlaylist(playlist) {
    this.setState({
      playlist: playlist
    });
  }

  _clickToPlayAll() {
    let noUpdate = true;

    Player.cleanupTracks(noUpdate);
    Player.addTracks(this.state.tracks);
    Player.playNextTrack(0);
  }

  render() {
    let playlistName = this.state.playlist.name || '';
    let tracks = this.state.tracks;
    let controls = {
      trackModeButton: true,
      playAllButton: true,
      deleteAllButton: false,
      addToPlayQueueButton: true
    };

    /* jshint ignore:start */
    return (
      <TracksComponent
        headerWording={playlistName}
        headerIconClass="fa fa-fw fa-music"
        controls={controls}
        tracks={tracks}
        onPlayAllClick={this._clickToPlayAll.bind(this)}
      />
    );
    /* jshint ignore:end */
  }
}

module.exports = PlaylistComponent;
