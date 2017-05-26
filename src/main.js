import React from 'react';
import ReactDOM from 'react-dom';
import Electron, {
  ipcRenderer as IpcRenderer,
  shell as Shell,
  remote as Remote,
} from 'electron';

const Dialog = Remote.dialog;
const App = Remote.app;

import ReactTooltip from 'react-tooltip';

// general modules
import ErrorMonitor from './modules/ErrorMonitor';
import PreferenceManager from './modules/PreferenceManager';
import TrackInfoFetcher from 'kaku-core/modules/TrackInfoFetcher';
import PlaylistManager from './modules/PlaylistManager';
import L10nManager from './modules/L10nManager';
import TopRanking from 'kaku-core/modules/TopRanking';
import AppCore from './modules/AppCore';
import Searcher from './modules/Searcher';
import AutoUpdater from './modules/AutoUpdater';
import Tracker from './modules/Tracker';

const _ = L10nManager.get.bind(L10nManager);

// views > components
import ToolbarComponent from './views/components/toolbar';
import TopRankingComponent from './views/components/topranking';
import NewsComponent from './views/components/news';
import AllTracksComponent from './views/components/alltracks';
import PlayerComponent from './views/components/player';
import MenusComponent from './views/components/menus';
import HistoryComponent from './views/components/history';
import PlayQueueComponent from './views/components/play-queue';
import PlaylistComponent from './views/components/playlist';
import SettingsComponent from './views/components/settings';
import OnlineDJComponent from './views/components/online-dj';
import AboutComponent from './views/components/about';
import ChatroomComponent from './views/components/chatroom';
import ConnectionCheckComponent from './views/components/connection-check';

// views > modules
import TabManager from './views/modules/TabManager';
import RemotePlayer from './views/modules/RemotePlayer';
import CastingManager from './views/modules/CastingManager';
import KonamiCodeManager from './views/modules/KonamiCodeManager';
import EasterEggs from './views/modules/EasterEggs';
import AppMenus from './views/modules/AppMenus';
import AppTray from './views/modules/AppTray';
import Player from './views/modules/Player';
import Notifier from './views/modules/Notifier';

const loadingPageDOM = document.querySelector('.loading-page');
const contentPageDOM = document.querySelector('.content-page');

var KakuApp = React.createClass({
  componentWillMount: function() {
    AppMenus.build();
    AppTray.build();

    window.addEventListener('beforeunload', () => {
      AppTray.destroy();
    });

    // this should be run first
    this._initializeDefaultTopRanking();

    // TODO
    // Need to figure out why `Loading` showing up so slowly
    setTimeout(() => {
      this._hideLoadingPage();
      this._triggerAutoUpdater();
    }, 3000);
  },

  componentDidMount: function() {
    this._bindShortcutEvents();
    this._bindTrayEvents();
    this._bindPlayerEvents();

    this._initializeAppTitle();
    this._initializeDefaultAlwaysOnTop();
    this._initializeDefaultChatroom();
    this._initializeDefaultLanguage();
    this._initializeDefaultSearcher();
    this._initializeDefaultTrackFormat();
    this._initializeDefaultVolume();
    this._initializeKonamiCode();

    // Initialize these after Player.js has been setup
    CastingManager.init();
    RemotePlayer.init();

    // Say hi :)
    Tracker.pageview('/').send();
  },

  _bindShortcutEvents: function() {
    IpcRenderer.on('key-MediaNextTrack', () => {
      Player.playNextTrack();
    });

    IpcRenderer.on('key-MediaPreviousTrack', () => {
      Player.playPreviousTrack();
    });

    IpcRenderer.on('key-MediaPlayPause', () => {
      Player.playOrPause();
    });

    IpcRenderer.on('key-Escape', () => {
      Player.exitFullscreen();
    });
  },

  _bindTrayEvents: function() {
    IpcRenderer.on('tray-MediaPreviousTrack', () => {
      Player.playPreviousTrack();
    });

    IpcRenderer.on('tray-MediaNextTrack', () => {
      Player.playNextTrack();
    });

    IpcRenderer.on('tray-MediaPlayPause', () => {
      Player.playOrPause();
    });
  },

  _bindPlayerEvents: function() {
    Player.on('play', () => {
      let playingTrack = Player.playingTrack;
      if (playingTrack) {
        let title = playingTrack.title;
        let maxLength = 40;
        let translatedTitle = _('app_title_playing', {
          name: title
        });
        if (translatedTitle.length > maxLength) {
          translatedTitle = translatedTitle.substr(0, maxLength) + ' ...';
        }
        AppCore.title = translatedTitle;
      }
    });

    Player.on('ended', () => {
      AppCore.title = _('app_title_normal');
    });
  },

  _initializeDefaultTopRanking: function() {
    var defaultCountryCode =
      PreferenceManager.getPreference('default.topRanking.countryCode');
    if (defaultCountryCode) {
      TopRanking.changeCountry(defaultCountryCode);
    }
  },

  _initializeAppTitle: function() {
    AppCore.title = _('app_title_normal');
  },

  _initializeDefaultAlwaysOnTop: function() {
    var defaultAlwaysOnTop =
      PreferenceManager.getPreference('default.alwaysOnTop.enabled');
    if (defaultAlwaysOnTop) {
      Remote.getCurrentWindow().setAlwaysOnTop(defaultAlwaysOnTop);
    }
  },

  _initializeDefaultChatroom: function() {
    var defaultChatroom =
      PreferenceManager.getPreference('default.chatroom.enabled');
    if (typeof defaultChatroom === 'undefined') {
      PreferenceManager.setPreference('default.chatroom.enabled', true);
    }
  },

  _initializeDefaultLanguage: function() {
    var defaultLanguage =
      PreferenceManager.getPreference('default.language');
    // For new users, there is no `defaultLanguage` in DB yet.
    if (defaultLanguage) {
      L10nManager.changeLanguage(defaultLanguage);
    }
  },

  _initializeDefaultSearcher: function() {
    var defaultSearcher =
      PreferenceManager.getPreference('default.searcher');
    if (defaultSearcher) {
      Searcher.changeSearcher(defaultSearcher);
    }
  },

  _initializeDefaultTrackFormat: function() {
    var defaultFormat =
      PreferenceManager.getPreference('default.track.format') || 'best';
    TrackInfoFetcher.changeFormat(defaultFormat);
  },

  _initializeDefaultVolume: function() {
    var defaultVolume =
      PreferenceManager.getPreference('default.volume') || 'default';
    Player.setVolume(defaultVolume);
  },

  _initializeKonamiCode: function() {
    KonamiCodeManager.attach(document.body, () => {
      EasterEggs.show();
    });
  },

  _triggerAutoUpdater: function() {
    AutoUpdater.updateApp();

    Notifier.alert('Auto updating core modules, please wait (it takes 5~30 secs for the first time)');
    AutoUpdater.updateYoutubeDl().then(() => {
      Notifier.alert('Done! You can play music now :)');
      console.log('updated youtube-dl successfully');
    }).catch(() => {
      Notifier.alert('Something went wrong, feel free to update manually in Settings');
      console.log('failed to update youtube-dl');
    });
  },

  _hideLoadingPage: function() {
    loadingPageDOM.hidden = true;
  },

  render: function() {
    return (
      <div className="root">
        <ConnectionCheckComponent/>
        <ChatroomComponent/>
        <div className="row row-no-padding top-row">
          <div className="col-md-12">
            <div className="toolbar-slot">
              <ToolbarComponent/>
            </div>
          </div>
        </div>
        <div className="row row-no-padding bottom-row">
          <div className="left">
            <div className="sidebar">
              <MenusComponent/>
              <PlayerComponent/>
            </div>
          </div>
          <div className="right">
            <div className="tab-content">
              <div
                role="tabpanel"
                className="tab-pane active"
                id="tab-home">
                  <TopRankingComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-news">
                  <NewsComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-search">
                  <AllTracksComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-settings">
                  <SettingsComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-online-dj">
                  <OnlineDJComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-about">
                  <AboutComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-history">
                  <HistoryComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-play-queue">
                  <PlayQueueComponent/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-playlist">
                  <PlaylistComponent/>
              </div>
            </div>
          </div>
        </div>
        <ReactTooltip/>
      </div>
    );
  }
});

ReactDOM.render(<KakuApp/>, contentPageDOM);
