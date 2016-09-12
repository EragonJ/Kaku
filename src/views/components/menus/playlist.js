import React from 'react';
import Electron from 'electron';

import TabManager from '../../modules/TabManager';
import PlaylistManager from '../../../modules/PlaylistManager';

const Remote = Electron.remote;
const Menu = Remote.Menu;
const MenuItem = Remote.MenuItem;

class PlaylistUI extends React.Component {
  constructor(props) {
    super(props);
  }

  _createContextMenuForPlaylist(playlist) {
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
  }

  _clickToShowContextMenu(playlist, event) {
    event.preventDefault();
    let menu = this._createContextMenuForPlaylist(playlist);
    menu.popup(Remote.getCurrentWindow());
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
  index: React.PropTypes.number,
  playlist: React.PropTypes.object
};

PlaylistUI.defaultProps = {
  index: 0,
  playlist: {}
};

export default PlaylistUI;
