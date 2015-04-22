define(function(require) {
  'use strict';

  var gui = requireNode('nw.gui');
  var YoutubeSearcher = require('backend/YoutubeSearcher');
  var PlaylistManager = require('backend/PlaylistManager');
  var Player = require('modules/Player');
  var React = require('react');

  var Track = React.createClass({
    propTypes: {
      data: React.PropTypes.object.isRequired
    },

    _fetchData: function() {
      var data = this.props.data;
      var promise = new Promise((resolve) => {
        var keyword = data.artist + ' - ' + data.title;
        YoutubeSearcher.search(keyword, 1).then(function(tracks) {
          var trackInfo = tracks[0];
          resolve(trackInfo);
        });
      });
      return promise;
    },

    _clickToPlay: function() {
      if (this.props.data.platformTrackUrl) {
        Player.play(this.props.data);
      }
      else {
        // for top ranking tracks, we have no data at first,
        // so we have to lazily fetch the information
        this._fetchData().then((data) => {
          Player.play(data);
        });
      }
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
      var data = this.props.data;

      /* jshint ignore:start */
      return (
        <div
          className="track"
          onClick={this._clickToPlay}
          onContextMenu={this._clickToShowContextMenu}>
            <img src={data.covers.medium} title={data.title}/>
            <div className="info">
              <div className="track-name">{data.title}</div>
              <div className="track-artist">{data.artist}</div>
            </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return Track;
});
