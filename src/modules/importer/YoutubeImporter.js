import UniqueId from 'kaku-core/modules/UniqueId';
import Youtube from '../wrapper/Youtube';
import PlaylistManager from '../../modules/PlaylistManager';
import YoutubeTrack from 'kaku-core/models/track/YoutubeTrack';

class YoutubeImporter {
  costructor() {
    // TODO
    // we need to add more protect here
    this._regex = /[&?]list=([a-z0-9_-]+)/i;
  }

  _getPlaylistTitle(id) {
    let promise = new Promise((resolve, reject) => {
      Youtube.getPlayListsById(id, (error, result) => {
        if (error) {
          reject(error);
        }
        else {
          let title =
            result.items &&
            result.items[0] &&
            result.items[0].snippet &&
            result.items[0].snippet.title ||
            'playlist - ' + UniqueId(6);
          resolve(title);
        }
      });
    });
    return promise;
  }

  import(url) {
    let id = this._parsePlaylistId(url);
    if (!id) {
      return Promise.reject();
    }

    return this._getPlaylistTitle(id).then((title) => {
      return PlaylistManager.addYoutubePlaylist(title, id);
    }).then((playlist) => {
      let promise = new Promise((resolve, reject) => {
        // TODO
        // support paging to make sure we can fetch all items back
        Youtube.getPlayListsItemsById(id, 50, (error, result) => {
          if (error) {
            reject(error);
          }
          else {
            let rawTracks = result.items || [];
            // change from rawData into YoutubeTrack
            let tracks = rawTracks.map((rawTrack) => {
              let youtubeTrack = new YoutubeTrack();
              youtubeTrack.initYoutubeResult(rawTrack);
              return youtubeTrack;
            });
            // add all tracks in one operation
            playlist.addTracks(tracks).then(() => {
              resolve(playlist);
            });
          }
        });
      });
      return promise;
    });
  }

  _parsePlaylistId(url) {
    url = url || '';
    let result;
    let matches = url.match(this._regex);

    if (matches && matches.length > 0) {
      return matches[1];
    }
  }
}

module.exports = new YoutubeImporter();
