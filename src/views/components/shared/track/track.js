import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Electron from 'electron';
import ClassNames from 'classnames';

import PlaylistManager from '../../../../modules/PlaylistManager';
import Notifier from '../../../modules/Notifier';
import Player from '../../../modules/Player';

import TrackList from './track-list';
import TrackSquare from './track-square';
import TabManager from '../../../modules/TabManager';

const Remote = Electron.remote;
const Menu = Remote.Menu;
const MenuItem = Remote.MenuItem;

class Track extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playingTrack: {}
    };

    this._setPlayingTrack = this._setPlayingTrack.bind(this);
    this._createContextMenu = this._createContextMenu.bind(this);
  }

  componentDidMount() {
    Player.on('play', this._setPlayingTrack);
  }

  componentWillUnmount() {
    Player.off('play', this._setPlayingTrack);
  }

  _setPlayingTrack() {
    this.setState({
      playingTrack: Player.playingTrack
    });
  }

  _clickToPlay(track) {
    if (TabManager.tabName === 'play-queue') {
      let index = this.props.index;
      Player.playNextTrack(index);
    }
    else {
      let noUpdate = true;
      Player.cleanupTracks(noUpdate);
      Player.addTracks([track]);
      Player.playNextTrack(0);
    }
  }

  _clickToShowContextMenu(track, event) {
    // TODO
    // if we are under playlist section already,
    // we should not shown this context menu
    event.preventDefault();
    let menu = this._createContextMenu(track);
    menu.popup(Remote.getCurrentWindow(), {
      async: true
    });
  }

  _createContextMenu(track) {
    let menu = new Menu();
    let playlists = PlaylistManager.playlists;
    let position = -1;

    if (TabManager.tabName !== 'play-queue') {
      let menuItemToAddToQueue = new MenuItem({
        label: 'Add to Queue',
        click: () => Player.addTracks([track])
      });
      menu.insert(++position, menuItemToAddToQueue);
    }

    playlists.forEach((playlist) => {
      let clickToAddTrack = ((playlist) => {
        return () => {
          playlist
            .addTrack(track)
            .catch((error) => {
              Notifier.alert(error);
            });
        };
      })(playlist);

      let clickToRemoveTrack = ((playlist) => {
        return () => {
          playlist
            .removeTrack(track)
            .catch((error) => {
              Notifier.alert(error);
            });
        };
      })(playlist);

      // TODO
      // add l10n support here
      let menuItemToAddTrack = new MenuItem({
        label: `Add to ${playlist.name}`,
        click: clickToAddTrack
      });

      let menuItemToRemoveTrack = new MenuItem({
        label: `Remove from ${playlist.name}`,
        click: clickToRemoveTrack
      });

      if (PlaylistManager.isDisplaying) {
        if (PlaylistManager.activePlaylist.isSameWith(playlist)) {
          menu.append(menuItemToRemoveTrack);
        }
        else {
          menu.insert(++position, menuItemToAddTrack);
        }
      }
      else {
        // TODO
        // we have to check if this track does exist in this playlist,
        // but no matter how, right now we have internal protect in
        // playlist.addTrack() to make sure we won't add the same track
        // to the same playlist.
        menu.insert(++position, menuItemToAddTrack);
      }
    });
    return menu;
  }

  render() {
    let mode = this.props.mode;
    let track = this.props.data;
    let trackClassName = ClassNames({
      track: true,
      'track-square': (mode === 'square'),
      'track-list': (mode === 'list'),
      active: track.isSameTrackWith(this.state.playingTrack)
    });

    let iconObject = {};
    iconObject.fa = true;

    switch (track.trackType) {
      case 'YoutubeTrack':
        iconObject['fa-youtube'] = true;
        break;

      case 'VimeoTrack':
        iconObject['fa-vimeo'] = true;
        break;

      case 'SoundCloudTrack':
        iconObject['fa-soundcloud'] = true;
        break;

      case 'MixCloudTrack':
        iconObject['fa-mixcloud'] = true;
        break;

      default:
        iconObject['fa-music'] = true;
        break;
    }

    let iconClassName = ClassNames(iconObject);
    let trackUI;
    let trackProps = {
      track: track,
      onClick: this._clickToPlay.bind(this, track),
      onContextMenu: this._clickToShowContextMenu.bind(this, track),
      iconClassName: iconClassName,
      trackClassName: trackClassName
    };

    // We will dispatch do different views here based on incoming mode
    if (mode === 'square') {
      trackUI = <TrackSquare {...trackProps} />;
    }
    else if (mode === 'list') {
      trackUI = <TrackList {...trackProps} />;
    }

    return trackUI;
  }
}

Track.propTypes = {
  data: PropTypes.object.isRequired,
  mode: PropTypes.string,
  index: PropTypes.number
};

Track.defaultProps = {
  data: {},
  mode: 'square',
  index: -1
};

module.exports = Track;
