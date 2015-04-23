define(function(require) {
  'use strict';

  var gui = requireNode("nw.gui");
  var crypto = requireNode('crypto');
  var CoreData = require('backend/CoreData');
  var PlaylistManager = require('backend/PlaylistManager');
  var TabManager = require('modules/TabManager');
  var React = require('react');
  var $ = require('jquery');

  var MenusContainer = React.createClass({
    getInitialState: function() {
      return {
        playlists: []
      };
    },

    componentDidMount: function() {
      // If we changed tab by API directly,
      // we have to reflect it to UI here
      TabManager.on('changed', (tabName) => {
        this._showTab(tabName);
      });

      this._bindTabChangeEvent();
    },

    componentDidUpdate: function() {
      this._unbindTabChangeEvent();
      this._bindTabChangeEvent();
    },

    _bindTabChangeEvent: function() {
      var self = this;
      var menusDOM = this.refs.menus.getDOMNode();
      var links = menusDOM.querySelectorAll('a[data-toggle="tab"]');

      // NOTE
      // not sure whether this would conflict with pre-bound
      // bootstrap events
      $(links).on('shown.bs.tab', function() {
        var href = $(this).attr('href');
        var tabOptions = $(this).attr('data-tab-options');
        var tabName = href.replace('#tab-', '');

        self._showTab(tabName);
        TabManager.setTab(tabName, tabOptions);
      });
    },

    _unbindTabChangeEvent: function() {
      var menusDOM = this.refs.menus.getDOMNode();
      var links = menusDOM.querySelectorAll('a[data-toggle="tab"]');
      $(links).off('shown.bs.tab');
    },

    _showTab: function(tabName) {
      var linkToTabRef = this.refs['tab-' + tabName];
      if (linkToTabRef) {
        $(linkToTabRef.getDOMNode()).tab('show');
      }
    },

    _updateInternalStates: function() {
      this.setState({
        playlists: PlaylistManager.playlists
      });
    },

    _addPlaylist: function() {
      // TODO
      // fix this native behavior with customzied dialog
      var randomSuffix = crypto.randomBytes(3).toString('hex');
      var rawPlaylistName = prompt('Please input your playlist name',
        'playlist-' + randomSuffix) || '';
      var sanitizedPlaylistName = rawPlaylistName.trim();
      if (!sanitizedPlaylistName) {
        alert('Please make sure you did input the playlist name');
      }
      else {
        PlaylistManager
          .addNormalPlaylist(sanitizedPlaylistName)
          .then(() => {
            this._updateInternalStates();
          })
          .catch((error) => {
            alert(error);
          });
      }
    },

    _createContextMenuForPlaylist: function(playlist) {
      var oldName = playlist.name;
      var menu = new gui.Menu();

      var removeMenuItem = new gui.MenuItem({
        label: 'Remove this playlist',
        click: () => {
          PlaylistManager
            .removePlaylist(oldName)
            .then(() => {
              this._updateInternalStates();
            })
            .catch((error) => {
              alert(error);
            });
        }
      });

      var renameMenuItem = new gui.MenuItem({
        label: 'Rename this playlist',
        click: () => {
          var rawPlaylistName = prompt('Please input your playlist name',
            oldName) || '';
          var sanitizedPlaylistName = rawPlaylistName.trim();
          if (!sanitizedPlaylistName) {
            alert('Please make sure you did input the playlist name');
          }
          else {
            PlaylistManager
              .rename(oldName, sanitizedPlaylistName)
              .then(() => {
                this._updateInternalStates();
              })
              .catch((error) => {
                alert(error);
              });
          }
        }
      });

      menu.append(renameMenuItem);
      menu.append(removeMenuItem);
      return menu;
    },

    _clickToShowContextMenu: function(playlist, event) {
      event.preventDefault();
      var menu = this._createContextMenuForPlaylist(playlist);
      menu.popup(event.clientX, event.clientY);
    },

    render: function() {
      var playlists = this.state.playlists;

      /* jshint ignore:start */
      return (
        <div className="menus">
          <ul className="list-unstyled" role="tablist" ref="menus">
            <li className="active" role="presentation">
              <a
                href="#tab-home"
                role="tab"
                data-toggle="tab"
                ref="tab-home">
                  <i className="icon fa fa-fw fa-lg fa-home"></i>
                  <span className="title">Home</span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-search"
                role="tab"
                data-toggle="tab"
                ref="tab-search">
                  <i className="icon fa fa-fw fa-lg fa-search"></i>
                  <span className="title">Search Results</span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-history"
                role="tab"
                data-toggle="tab"
                ref="tab-history">
                  <i className="icon fa fa-fw fa-lg fa-history"></i>
                  <span className="title">Histories</span>
              </a>
            </li>
            <li>
              <a href="#" onClick={this._addPlaylist}>
                <i className="icon fa fa-fw fa-lg fa-plus"></i>
                <span className="title">Add Playlist</span>
              </a>
            </li>
            {playlists.map((playlist) => {
              var clickToShowContextMenu =
                this._clickToShowContextMenu.bind(this, playlist);
              return (
                <li role="presentation" className="playlist">
                  <a
                    href="#tab-playlist"
                    role="tab"
                    data-toggle="tab"
                    data-tab-options={playlist.id}
                    onContextMenu={clickToShowContextMenu}
                    ref="tab-playlist">
                      <i className="icon fa fa-fw fa-lg fa-music"></i>
                      <span className="title">{playlist.name}</span>
                    </a>
                </li>
              );
            })}
          </ul>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return MenusContainer;
});
