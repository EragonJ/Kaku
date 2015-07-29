// TODO
// if nw.js support chrome > 41, change to use latest fetch API
var fetchRjsConfig = function() {
  var promise = new Promise(function(resolve) {
    var request = new XMLHttpRequest();
    request.open('GET', 'config/rjs_config.json', true);
    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        var rjsConfig = JSON.parse(request.responseText);
        resolve(rjsConfig);
      }
    };
    request.send();
  });
  return promise;
};

fetchRjsConfig().then(function(rjsConfig) {
  requirejs.config(rjsConfig);
  requirejs([
    'react',
    'components/toolbar/container',
    'components/topranking/container',
    'components/news/container',
    'components/alltracks/container',
    'components/player/container',
    'components/menus/container',
    'components/history/container',
    'components/playlist/container',
    'components/settings/container',
    'components/about/container',
    'components/connection-check/container',
    'backend/modules/PreferenceManager',
    'backend/modules/PlaylistManager',
    'backend/modules/L10nManager',
    'backend/modules/KakuCore',
    'backend/modules/Searcher',
    'backend/modules/AutoUpdater',
    'backend/modules/Tracker',
    'modules/TabManager',
    'modules/KonamiCodeManager',
    'modules/EasterEggs',
    'jquery'
  ], function (
    React,
    ToolbarContainer,
    TopRankingContainer,
    NewsContainer,
    AllTracksContainer,
    PlayerContainer,
    MenusContainer,
    HistoryContainer,
    PlaylistContainer,
    SettingsContainer,
    AboutContainer,
    ConnectionCheckContainer,
    PreferenceManager,
    PlaylistManager,
    L10nManager,
    KakuCore,
    Searcher,
    AutoUpdater,
    Tracker,
    TabManager,
    KonamiCodeManager,
    EasterEggs,
    $
  ) {
    // NOTE:
    // please check https://github.com/atom/electron/issues/254
    window.$ = window.jQuery = $;
    requirejs(['bootstrap']);

    var loadingPageDOM = document.querySelector('.loading-page');
    var contentPageDOM = document.querySelector('.content-page');

    var shell = requireNode('shell');
    var remote = requireNode('remote');
    var dialog = remote.require('dialog');
    var App = remote.require('app');

    var KakuApp = React.createClass({
      componentWillMount: function() {
        this._hideLoadingPage();
      },

      componentDidMount: function() {
        this._triggerAutoUpdater();
        this._initializeAppTitle();
        this._initializeDefaultLanguage();
        this._initializeDefaultSearcher();
        this._initializeKonamiCode();

        // Say hi :)
        Tracker.pageview('/').send();
      },

      _initializeAppTitle: function() {
        L10nManager.get('app_title_normal').then((translatedTitle) => {
          KakuCore.title = translatedTitle;
        });
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
            dialog.showMessageBox({
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
          </div>
        );
        /* jshint ignore:end */
      }
    });

    /* jshint ignore:start */
    React.render(<KakuApp/>, contentPageDOM);
    /* jshint ignore:end */
  });
});
