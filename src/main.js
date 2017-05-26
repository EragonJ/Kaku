var React = require('react');
var ReactDOM = require('react-dom');
var Electron = require('electron');
var IpcRenderer = Electron.ipcRenderer;
var Shell = Electron.shell;
var Remote = Electron.remote;
var Dialog = Remote.dialog;
var App = Remote.app;

var ReactTooltip = require('react-tooltip');

// general modules
var ErrorMonitor = require('./modules/ErrorMonitor');
var PreferenceManager = require('./modules/PreferenceManager');
var TrackInfoFetcher = require('kaku-core/modules/TrackInfoFetcher');
var PlaylistManager = require('./modules/PlaylistManager');
var L10nManager = require('./modules/L10nManager');
var TopRanking = require('kaku-core/modules/TopRanking');
var AppCore = require('./modules/AppCore');
var Searcher = require('./modules/Searcher');
var AutoUpdater = require('./modules/AutoUpdater');
var Tracker = require('./modules/Tracker');
var _ = L10nManager.get.bind(L10nManager);

// views > components
var ToolbarComponent = require('./views/components/toolbar');
var TopRankingComponent = require('./views/components/topranking');
var NewsComponent = require('./views/components/news');
var AllTracksComponent = require('./views/components/alltracks');
var PlayerComponent = require('./views/components/player');
var MenusComponent = require('./views/components/menus');
var HistoryComponent = require('./views/components/history');
var PlayQueueComponent = require('./views/components/play-queue');
var PlaylistComponent = require('./views/components/playlist');
var SettingsComponent = require('./views/components/settings');
var OnlineDJComponent = require('./views/components/online-dj');
var AboutComponent = require('./views/components/about');
var ChatroomComponent = require('./views/components/chatroom');
var ConnectionCheckComponent = require('./views/components/connection-check');

// views > modules
var TabManager = require('./views/modules/TabManager');
var RemotePlayer = require('./views/modules/RemotePlayer');
var CastingManager = require('./views/modules/CastingManager');
var KonamiCodeManager = require('./views/modules/KonamiCodeManager');
var EasterEggs = require('./views/modules/EasterEggs');
var AppMenus = require('./views/modules/AppMenus');
var AppTray = require('./views/modules/AppTray');
var Player = require('./views/modules/Player');
var Notifier = require('./views/modules/Notifier');

var loadingPageDOM = document.querySelector('.loading-page');
var contentPageDOM = document.querySelector('.content-page');

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
    /* jshint ignore:start */
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
    /* jshint ignore:end */
  }
});

/* jshint ignore:start */
ReactDOM.render(<KakuApp/>, contentPageDOM);
/* jshint ignore:end */
