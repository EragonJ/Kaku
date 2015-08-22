var remote = require('remote');
var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var React = require('react');
var ClassNames = require('classnames');

var PlaylistManager = require('../../../modules/PlaylistManager');
var Notifier = require('../../modules/Notifier');
var Player = require('../../modules/Player');

var Track = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      playingTrack: {}
    };
  },

  componentDidMount: function() {
    Player.on('play', () => {
      this.setState({
        playingTrack: Player.playingTrack
      });
    });
  },

  _clickToPlay: function() {
    Player.play(this.props.data);
  },

  _clickToShowContextMenu: function(event) {
    // TODO
    // if we are under playlist section already,
    // we should not shown this context menu
    event.preventDefault();
    var menu = this._createContextMenu();
    menu.popup(remote.getCurrentWindow());
  },

  _createContextMenu: function() {
    var menu = new Menu();
    var playlists = PlaylistManager.playlists;

    playlists.forEach((playlist) => {
      var clickToAddTrack = ((playlist) => {
        return () => {
          playlist
            .addTrack(this.props.data)
            .catch((error) => {
              Notifier.alert(error);
            });
        };
      }(playlist));

      var clickToRemoveTrack = ((playlist) => {
        return () => {
          playlist
            .removeTrack(this.props.data)
            .catch((error) => {
              Notifier.alert(error);
            });
        };
      }(playlist));

      // TODO
      // add l10n support here
      var menuItemToAddTrack = new MenuItem({
        label: 'Add to ' + playlist.name,
        click: clickToAddTrack
      });

      var menuItemToRemoveTrack = new MenuItem({
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
    var trackIcon;
    var track = this.props.data;
    var isActive = track.isSameTrackWith(this.state.playingTrack);
    var className = ClassNames({
      track: true,
      active: isActive
    });

    var iconClassName;
    var iconObject = {};
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

    iconClassName = ClassNames(iconObject);

    /* jshint ignore:start */
    return (
      <div
        className={className}
        onClick={this._clickToPlay}
        onContextMenu={this._clickToShowContextMenu}
        ref="trackBlock">
          <img src={track.covers.medium} title={track.title}/>
          <div className="ribbon">
            <i className={iconClassName}></i>
          </div>
          <div className="info">
            <div className="track-name">{track.title}</div>
            <div className="track-artist">{track.artist}</div>
          </div>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = Track;
