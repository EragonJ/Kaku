var React = require('react');
var shell = require('shell');
var Remote = require('remote');
var Dialog = Remote.require('dialog');
var App = Remote.require('app');

var ReactTooltip = require('react-tooltip');

// general modules
var PreferenceManager = require('./modules/PreferenceManager');
var TrackInfoFetcher = require('./modules/TrackInfoFetcher');
var PlaylistManager = require('./modules/PlaylistManager');
var L10nManager = require('./modules/L10nManager');
var TopRanking = require('./modules/TopRanking');
var KakuCore = require('./modules/KakuCore');
var Searcher = require('./modules/Searcher');
var AutoUpdater = require('./modules/AutoUpdater');
var Tracker = require('./modules/Tracker');
var _ = L10nManager.get.bind(L10nManager);

// views > components
var ToolbarContainer = require('./views/components/toolbar/container');
var TopRankingContainer = require('./views/components/topranking/container');
var NewsContainer = require('./views/components/news/container');
var AllTracksContainer = require('./views/components/alltracks/container');
var PlayerContainer = require('./views/components/player/container');
var MenusContainer = require('./views/components/menus/container');
var HistoryContainer = require('./views/components/history/container');
var PlaylistContainer = require('./views/components/playlist/container');
var SettingsContainer = require('./views/components/settings/container');
var AboutContainer = require('./views/components/about/container');
var ConnectionCheckContainer =
  require('./views/components/connection-check/container');

// views > modules
var TabManager = require('./views/modules/TabManager');
var KonamiCodeManager = require('./views/modules/KonamiCodeManager');
var EasterEggs = require('./views/modules/EasterEggs');
var AppMenus = require('./views/modules/AppMenus');

var loadingPageDOM = document.querySelector('.loading-page');
var contentPageDOM = document.querySelector('.content-page');

var KakuApp = React.createClass({
  componentWillMount: function() {
    AppMenus.build();

    // this should be run first
    this._initializeDefaultTopRanking();

    // TODO
    // Need to figure out why `Loading` showing up so slowly
    setTimeout(() => {
      this._hideLoadingPage();
    }, 1000);
  },

  componentDidMount: function() {
    this._triggerAutoUpdater();
    this._initializeAppTitle();
    this._initializeDefaultAlwaysOnTop();
    this._initializeDefaultLanguage();
    this._initializeDefaultSearcher();
    this._initializeDefaultTrackFormat();
    this._initializeKonamiCode();

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
    KakuCore.title = _('app_title_normal');
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
    Searcher.changeSearcher(defaultSearcher);
  },

  _initializeDefaultTrackFormat: function() {
    var defaultFormat =
      PreferenceManager.getPreference('default.track.format') || 'best';
    TrackInfoFetcher.changeFormat(defaultFormat);
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
          title: 'New release',
          message:
            'Detect a new release version ' + release.version + '\n' +
            'Click ok to download it.',
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
              shell.openExternal(downloadLink);
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
        <ConnectionCheckContainer/>
        <div className="row row-no-padding top-row">
          <div className="col-md-12">
            <div className="toolbar-slot">
              <ToolbarContainer/>
            </div>
          </div>
        </div>
        <div className="row row-no-padding bottom-row">
          <div className="left">
            <div className="sidebar">
              <MenusContainer/>
              <PlayerContainer/>
            </div>
          </div>
          <div className="right">
            <div className="tab-content">
              <div
                role="tabpanel"
                className="tab-pane active"
                id="tab-home">
                  <TopRankingContainer/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-news">
                  <NewsContainer/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-search">
                  <AllTracksContainer/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-settings">
                  <SettingsContainer/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-about">
                  <AboutContainer/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-history">
                  <HistoryContainer/>
              </div>
              <div
                role="tabpanel"
                className="tab-pane"
                id="tab-playlist">
                  <PlaylistContainer/>
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
React.render(<KakuApp/>, contentPageDOM);
/* jshint ignore:end */
