import React from 'react';
import PropTypes from 'prop-types';
import Electron from 'electron';

import TabManager from '../../modules/TabManager';
import PlaylistManager from '../../../modules/PlaylistManager';
import Notifier from '../../modules/Notifier';
import Dialog from '../../modules/Dialog';

const Remote = Electron.remote;
const Menu = Remote.Menu;
const MenuItem = Remote.MenuItem;

class PlaylistUI extends React.Component {
  constructor(props) {
    super(props);
  }

  _createContextMenuForPlaylist(playlist) {
    let menu = new Menu();

    let removeMenuItem = new MenuItem({
      label: 'Remove this playlist',
      click: () => {
        PlaylistManager
          .removePlaylistById(playlist.id)
          .catch((error) => {
            Notifier.alert(error);
          });
      }
    });

    let renameMenuItem = new MenuItem({
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
  }

  _clickToShowContextMenu(playlist, event) {
    event.preventDefault();
    let menu = this._createContextMenuForPlaylist(playlist);
    menu.popup(Remote.getCurrentWindow(), {
      async: true
    });
  }

  _clickToSetTab(id) {
    TabManager.setTab('playlist', id);
  }

  render() {
    let index = this.props.index;
    let playlist = this.props.playlist;

    let clickToShowContextMenu =
      this._clickToShowContextMenu.bind(this, playlist);

    let clickToSetTab =
      this._clickToSetTab.bind(this, playlist.id);

    return (
      <li role="presentation" className="playlist">
        <a
          href="#tab-playlist"
          role="tab"
          data-tab-options={playlist.id}
          data-toggle="tab"
          onContextMenu={clickToShowContextMenu}
          onClick={clickToSetTab}>
            <i className="icon fa fa-fw fa-lg fa-music"></i>
            <span className="title">{playlist.name}</span>
          </a>
      </li>
    );
  }
};

PlaylistUI.propTypes = {
  index: PropTypes.number,
  playlist: PropTypes.object
};

PlaylistUI.defaultProps = {
  index: 0,
  playlist: {}
};

export default PlaylistUI;
