define(function(require) {
  'use strict';

  var crypto = requireNode('crypto');
  var remote = requireNode('remote');
  var Menu = remote.require('menu');
  var MenuItem = remote.require('menu-item');

  var $ = require('jquery');
  var React = require('react');

  var PlaylistManager = require('backend/modules/PlaylistManager');
  var L10nManager = require('backend/modules/L10nManager');
  var TabManager = require('modules/TabManager');
  var Notifier = require('modules/Notifier');
  var Dialog = require('modules/Dialog');

  var L10nSpan = require('components/shared/l10n-span');

  var MenusContainer = React.createClass({
    getInitialState: function() {
      return {
        playlists: []
      };
    },

    componentDidMount: function() {
      // tab is clicked -> trigger bootstrap .tab('show')
      //                -> trigger TabManager.on('changed')
      TabManager.on('changed', (tabName, tabOptions) => {
        this._showTab(tabName, tabOptions);
      });

      PlaylistManager.ready().then(() => {
        this._updatePlaylistsStates();
      });

      PlaylistManager.on('imported', () => {
        this._updatePlaylistsStates();
      });

      PlaylistManager.on('cleanup', () => {
        this._updatePlaylistsStates();
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
      var links = menusDOM.querySelectorAll('a[role="tab"]');

      // NOTE
      // not sure whether this would conflict with pre-bound
      // bootstrap events
      $(links).on('click', function() {
        var href = $(this).attr('href');
        var tabOptions = $(this).attr('data-tab-options');
        var tabName = href.replace('#tab-', '');
        TabManager.setTab(tabName, tabOptions);
      });
    },

    _unbindTabChangeEvent: function() {
      var menusDOM = this.refs.menus.getDOMNode();
      var links = menusDOM.querySelectorAll('a[role="tab"]');
      $(links).off('click');
    },

    _showTab: function(tabName, tabOptions) {
      var linkToTabRef;
      if (tabName === 'playlist') {
        var playlistId = tabOptions;
        linkToTabRef = this.refs['tab-playlist' + playlistId];
      }
      else {
        linkToTabRef = this.refs['tab-' + tabName];
      }

      if (linkToTabRef) {
        $(linkToTabRef.getDOMNode()).tab('show');
      }
    },

    _updatePlaylistsStates: function() {
      this.setState({
        playlists: PlaylistManager.playlists
      });
    },

    _addPlaylist: function() {
      var randomSuffix = crypto.randomBytes(3).toString('hex');
      Promise.all([
        L10nManager.get('notifier_input_playlist_name'),
        L10nManager.get('notifier_playlist')
      ]).then((translations) => {
        Dialog.prompt({
          title: translations[0],
          value: translations[1] + '-' + randomSuffix,
          callback: (rawPlaylistName) => {
            rawPlaylistName = rawPlaylistName || '';
            var sanitizedPlaylistName = rawPlaylistName.trim();
            if (!sanitizedPlaylistName) {
              // do nothing
            }
            else {
              PlaylistManager
                .addNormalPlaylist(sanitizedPlaylistName)
                .then(() => {
                  this._updatePlaylistsStates();
                })
                .catch((error) => {
                  Notifier.alert(error);
                });
            }
          }
        });
      });
    },

    _createContextMenuForPlaylist: function(playlist) {
      var menu = new Menu();

      var removeMenuItem = new MenuItem({
        label: 'Remove this playlist',
        click: () => {
          PlaylistManager
            .removePlaylistById(playlist.id)
            .then(() => {
              this._updatePlaylistsStates();
              // [Note]
              // Redirect users back to default home page, otherwise they
              // will still see deleted page on the screen.
              TabManager.setTab('home');
            })
            .catch((error) => {
              Notifier.alert(error);
            });
        }
      });

      var renameMenuItem = new MenuItem({
        label: 'Rename this playlist',
        click: () => {
          Dialog.prompt({
            title: 'Please input your playlist name',
            value: playlist.name,
            callback: (rawPlaylistName) => {
              rawPlaylistName = rawPlaylistName || '';
              var sanitizedPlaylistName = rawPlaylistName.trim();
              if (!sanitizedPlaylistName) {
                // do nothing
              }
              else {
                PlaylistManager
                  .renamePlaylistById(playlist.id, sanitizedPlaylistName)
                  .then(() => {
                    this._updatePlaylistsStates();
                  })
                  .catch((error) => {
                    Notifier.alert(error);
                  });
              }
            }
          });
        }
      });

      menu.append(renameMenuItem);
      menu.append(removeMenuItem);
      return menu;
    },

    _clickToShowContextMenu: function(playlist, event) {
      event.preventDefault();
      var menu = this._createContextMenuForPlaylist(playlist);
      menu.popup(remote.getCurrentWindow());
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
                ref="tab-home">
                  <i className="icon fa fa-fw fa-lg fa-home"></i>
                  <span className="title"><L10nSpan l10nId="sidebar_home"/></span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-news"
                role="tab"
                ref="tab-news">
                  <i className="icon fa fa-fw fa-lg fa-rss"></i>
                  <span className="title"><L10nSpan l10nId="sidebar_news"/></span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-search"
                role="tab"
                ref="tab-search">
                  <i className="icon fa fa-fw fa-lg fa-search"></i>
                  <span className="title"><L10nSpan l10nId="sidebar_search_results"/></span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-history"
                role="tab"
                ref="tab-history">
                  <i className="icon fa fa-fw fa-lg fa-history"></i>
                  <span className="title"><L10nSpan l10nId="sidebar_history"/></span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-settings"
                role="tab"
                ref="tab-settings">
                  <i className="icon fa fa-fw fa-lg fa-cog"></i>
                  <span className="title"><L10nSpan l10nId="sidebar_settings"/></span>
              </a>
            </li>
            <li role="presentation">
              <a
                href="#tab-about"
                role="tab"
                ref="tab-about">
                  <i className="icon fa fa-fw fa-lg fa-info"></i>
                  <span className="title"><L10nSpan l10nId="sidebar_about"/></span>
              </a>
            </li>
            <li className="seperator">
            </li>
            <li className="add-playlist">
              <a href="#" onClick={this._addPlaylist}>
                <i className="icon fa fa-fw fa-lg fa-plus"></i>
                <span className="title"><L10nSpan l10nId="sidebar_add_playlist"/></span>
              </a>
            </li>
            {playlists.map((playlist) => {
              var ref= 'tab-playlist' + playlist.id;
              var clickToShowContextMenu =
                this._clickToShowContextMenu.bind(this, playlist);
              return (
                <li role="presentation" className="playlist">
                  <a
                    href="#tab-playlist"
                    role="tab"
                    data-tab-options={playlist.id}
                    onContextMenu={clickToShowContextMenu}
                    ref={ref}>
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
