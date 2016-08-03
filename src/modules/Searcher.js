import { EventEmitter } from 'events';
import Constants from './Constants';

// searchers
import YoutubeSearcher from 'kaku-core/modules/searcher/YoutubeSearcher';
import VimeoSearcher from 'kaku-core/modules/searcher/VimeoSearcher';
import SoundCloudSearcher from 'kaku-core/modules/searcher/SoundCloudSearcher';

class Searcher extends EventEmitter {
  constructor() {
    super();

    // default searcher
    this._selectedSearcherName = 'youtube';

    // supported searchers
    this._searchers = {
      'youtube': new YoutubeSearcher({
        apiKey: Constants.API.YOUTUBE_API_KEY
      }),
      'vimeo': new VimeoSearcher({
        clientId: Constants.API.VIMEO_API_CLIENT_ID,
        clientSecret: Constants.API.VIMEO_API_CLIENT_SECRET
      }),
      'soundcloud': new SoundCloudSearcher({
        clientId: Constants.API.SOUND_CLOUD_API_CLIENT_ID,
        clientSecret: Constants.API.SOUND_CLOUD_API_CLIENT_SECRET
      })
    };

    this._searchResults = [];
  }

  get selectedSearcher() {
    return this._searchers[this._selectedSearcherName];
  }

  get searchResults() {
    return this._searchResults;
  }

  getSupportedSearchers() {
    let promise = new Promise((resolve, rejct) => {
      resolve(Object.keys(this._searchers));
    });
    return promise;
  }

  search(keyword, limit, toSave = false) {
    if (!keyword) {
      return Promise.resolve([]);
    }
    else {
      return this.selectedSearcher.search(keyword, limit).then((results) => {
        if (toSave) {
          this._searchResults = results;
          this.emit('search-results-updated', results);
        }
        return results;
      });
    }
  }

  changeSearcher(searcherName) {
    let searcher = this._searchers[searcherName];
    if (searcher) {
      this._selectedSearcherName = searcherName;
      this.emit('searcher-changed', searcherName);
    }
  }
}

module.exports = new Searcher();
