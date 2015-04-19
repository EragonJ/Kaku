define(function(require) {
  'use strict';

  var gui = requireNode('nw.gui');
  var CoreData = require('backend/CoreData');
  var PlaylistManager = require('backend/PlaylistManager');
  var React = require('react');

  var Track = React.createClass({
    propTypes: {
      data: React.PropTypes.object.isRequired,
      fetchDataFn: React.PropTypes.func
    },

    _clickToPlay: function() {
      var fetchDataFn = this.props.fetchDataFn || () => {
        var promise = new Promise((resolve) => {
          resolve(this.props.data);
        });
        return promise;
      };
      fetchDataFn().then(function(data) {
        CoreData.set('currentTrack', data);
      });
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
            playlist.addTrack(this.props.data);
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
