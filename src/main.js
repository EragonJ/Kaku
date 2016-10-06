var React = require('react');
var ReactDOM = require('react-dom');
var Electron = require('electron');
var Shell = Electron.shell;
var Remote = Electron.remote;
var Dialog = Remote.dialog;
var App = Remote.app;

var ReactTooltip = require('react-tooltip');

// general modules
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
    }, 3000);
  },

  componentDidMount: function() {
    this._triggerAutoUpdater();
    this._initializeAppTitle();
    this._initializeDefaultAlwaysOnTop();
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
    AutoUpdater.checkUpdate().then((result) => {
      if (result.isNewer) {
        var release = result.release;
        // TODO
        // Need l10n here
        Dialog.showMessageBox({
          type: 'info',
          title: 'New Release is Ready',
          message:
            'Click ok to download Kaku version ' + release.version + '.',
          detail: release.note,
          buttons: ['ok', 'cancel']
        }, (response) => {
          // means ok
          if (response === 0) {
            var downloadLink = '';
            var platform = process.platform;
            var arch = process.arch;

            if (platform.match(/win32/)) {
              downloadLink = release.download.win.link;
            }
            else if (platform.match(/darwin/)) {
              downloadLink = release.download.mac.link;
            }
            else if (platform.match(/linux/)) {
              if (arch === 'x64') {
                downloadLink = release.download.linux64.link;
              }
              else {
                downloadLink = release.download.linux32.link;
              }
            }

            if (downloadLink) {
              Shell.openExternal(downloadLink);
              // a little delay to quit application
              setTimeout(() => {
                App.quit();
              }, 1000);
            }
            else {
              console.log('Cant find download link for the user');
              console.log('platform - ' + platform + ', arch - ', arch);
            }
          }
        });
      }
      else {
        // Silently update the core modules for users when bootup everytime !
        AutoUpdater.updateYoutubeDl();
      }
    });
  },

  _hideLoadingPage: function() {
    // for better UX
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
