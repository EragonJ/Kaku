let Electron = require('electron');
let Remote = Electron.remote;
let Menu = Remote.Menu;
let MenuItem = Remote.MenuItem;

let React = require('react');
let ClassNames = require('classnames');

let PlaylistManager = require('../../../../modules/PlaylistManager');
let Notifier = require('../../../modules/Notifier');
let Player = require('../../../modules/Player');

let TrackList = require('./track-list');
let TrackSquare = require('./track-square');
let TabManager = require('../../../modules/TabManager');

let Track = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired,
    mode: React.PropTypes.string,
    index: React.PropTypes.number
  },

  getDefaultProps: function() {
    return {
      data: {},
      mode: 'square',
      index: -1
    };
  },

  getInitialState: function() {
    return {
      playingTrack: {}
    };
  },

  componentDidMount: function() {
    Player.on('play', this._setPlayingTrack);
  },

  componentWillUnmount: function() {
    Player.off('play', this._setPlayingTrack);
  },

  _setPlayingTrack: function() {
    this.setState({
      playingTrack: Player.playingTrack
    });
  },

  _clickToPlay: function(track) {
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
  },

  _clickToShowContextMenu: function(track, event) {
    // TODO
    // if we are under playlist section already,
    // we should not shown this context menu
    event.preventDefault();
    let menu = this._createContextMenu(track);
    menu.popup(Remote.getCurrentWindow());
  },

  _createContextMenu: function(track) {
    let menu = new Menu();
    let playlists = PlaylistManager.playlists;

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
        label: 'Add to ' + playlist.name,
        click: clickToAddTrack
      });

      let menuItemToRemoveTrack = new MenuItem({
        label: 'Remove from ' + playlist.name,
        click: clickToRemoveTrack
      });

      if (PlaylistManager.isDisplaying) {
        if (PlaylistManager.activePlaylist.isSameWith(playlist)) {
          menu.append(menuItemToRemoveTrack);
        }
        else {
          menu.insert(0, menuItemToAddTrack);
        }
      }
      else {
        // TODO
        // we have to check if this track does exist in this playlist,
        // but no matter how, right now we have internal protect in
        // playlist.addTrack() to make sure we won't add the same track
        // to the same playlist.
        menu.insert(0, menuItemToAddTrack);
      }
    });
    return menu;
  },

  render: function() {
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

    /* jshint ignore:start */
    // We will dispatch do different views here based on incoming mode
    if (mode === 'square') {
      trackUI = <TrackSquare {...trackProps} />;
    }
    else if (mode === 'list') {
      trackUI = <TrackList {...trackProps} />;
    }

    return trackUI;
    /* jshint ignore:end */
  }
});

module.exports = Track;
