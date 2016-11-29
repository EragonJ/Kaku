import UniqueId from 'kaku-core/modules/UniqueId';
import Electron from 'electron';

const Remote = Electron.remote;
const Menu = Remote.Menu;
const MenuItem = Remote.MenuItem;

import $ from 'jquery';
import React from 'react';

import PlaylistUI from './playlist';

import PlaylistManager from '../../../modules/PlaylistManager';
import L10nManager from '../../../modules/L10nManager';
import TabManager from '../../modules/TabManager';
import Notifier from '../../modules/Notifier';
import Dialog from '../../modules/Dialog';

const _ = L10nManager.get.bind(L10nManager);

import L10nSpan from '../shared/l10n-span';

var MenusComponent = React.createClass({
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

    PlaylistManager.on('added', () => {
      this._updatePlaylistsStates();
    });

    PlaylistManager.on('removed', () => {
      this._updatePlaylistsStates();
    });

    PlaylistManager.on('imported', () => {
      this._updatePlaylistsStates();
    });

    PlaylistManager.on('cleanup', () => {
      this._updatePlaylistsStates();
    });
  },

  _showTab: function(tabName, tabOptions) {
    let sel;

    if (tabName === 'playlist') {
      sel = `a[href="#tab-playlist"][data-tab-options="${tabOptions}"]`;
    }
    else {
      sel = `a[href="#tab-${tabName}"]`;
    }

    if (sel) {
      $(sel).tab('show');
    }
  },

  _updatePlaylistsStates: function() {
    this.setState({
      playlists: PlaylistManager.playlists
    });
  },

  _addPlaylist: function() {
    var randomSuffix = UniqueId(6);
    Dialog.prompt({
      title: _('notifier_input_playlist_name'),
      value: _('notifier_playlist') + '-' + randomSuffix,
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
              // playlist UI will be re-created by event
            })
            .catch((error) => {
              Notifier.alert(error);
            });
        }
      }
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
            // playlist UI will be re-created by event
            //
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
    menu.popup(Remote.getCurrentWindow());
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
              onClick={function() {
                TabManager.setTab('home');
              }}>
                <i className="icon fa fa-fw fa-lg fa-home"></i>
                <span className="title"><L10nSpan l10nId="sidebar_home"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-news"
              role="tab"
              onClick={function() {
                TabManager.setTab('news');
              }}>
                <i className="icon fa fa-fw fa-lg fa-rss"></i>
                <span className="title"><L10nSpan l10nId="sidebar_news"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-search"
              role="tab"
              onClick={function() {
                TabManager.setTab('search');
              }}>
                <i className="icon fa fa-fw fa-lg fa-search"></i>
                <span className="title"><L10nSpan l10nId="sidebar_search_results"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-play-queue"
              role="tab"
              onClick={function() {
                TabManager.setTab('play-queue');
              }}>
                <i className="icon fa fa-fw fa-lg fa-ellipsis-h"></i>
                <span className="title"><L10nSpan l10nId="sidebar_play_queue"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-history"
              role="tab"
              onClick={function() {
                TabManager.setTab('history');
              }}>
                <i className="icon fa fa-fw fa-lg fa-history"></i>
                <span className="title"><L10nSpan l10nId="sidebar_history"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-settings"
              role="tab"
              onClick={function() {
                TabManager.setTab('settings');
              }}>
                <i className="icon fa fa-fw fa-lg fa-cog"></i>
                <span className="title"><L10nSpan l10nId="sidebar_settings"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-online-dj"
              role="tab"
              onClick={function() {
                TabManager.setTab('online-dj');
              }}>
                <i className="icon fa fa-fw fa-lg fa-headphones"></i>
                <span className="title"><L10nSpan l10nId="sidebar_online_dj"/></span>
            </a>
          </li>
          <li role="presentation">
            <a
              href="#tab-about"
              role="tab"
              onClick={function() {
                TabManager.setTab('about');
              }}>
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
          {playlists.map((playlist, index) => {
            return (
              <PlaylistUI
                playlist={playlist}
                key={index}
                index={index}>
              </PlaylistUI>
            );
          })}
        </ul>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = MenusComponent;
