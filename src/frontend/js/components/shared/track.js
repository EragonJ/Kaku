define(function(require) {
  'use strict';

  var gui = requireNode('nw.gui');
  var YoutubeSearcher = require('backend/YoutubeSearcher');
  var PlaylistManager = require('backend/PlaylistManager');
  var Player = require('modules/Player');
  var React = require('react');
  var ClassNames = require('classnames');

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
      menu.popup(event.clientX, event.clientY);
    },

    _createContextMenu: function() {
      var menu = new gui.Menu();
      var playlists = PlaylistManager.playlists;
      // TODO
      // what should we do if there is no playlist ?
      playlists.forEach((playlist) => {
        var menuItem = new gui.MenuItem({
          label: 'Add to ' + playlist.name
        });

        menuItem.click = ((playlist) => {
          return () => {
            playlist
              .addTrack(this.props.data)
              .catch((error) => {
                alert(error);
              });
          };
        }(playlist));

        menu.append(menuItem);
      });
      return menu;
    },

    render: function() {
      var track = this.props.data;
      var isActive = track.isSameTrackWith(this.state.playingTrack);
      var className = ClassNames({
        track: true,
        active: isActive
      });

      /* jshint ignore:start */
      return (
        <div
          className={className}
          onClick={this._clickToPlay}
          onContextMenu={this._clickToShowContextMenu}
          ref="trackBlock">
            <img src={track.covers.medium} title={track.title}/>
            <div className="info">
              <div className="track-name">{track.title}</div>
              <div className="track-artist">{track.artist}</div>
            </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return Track;
});
