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
    'components/alltracks/container',
    'components/player/container',
    'components/menus/container',
    'components/history/container',
    'components/playlist/container',
    'components/settings/container',
    'components/connection-check/container',
    'backend/PreferenceManager',
    'backend/PlaylistManager',
    'backend/L10nManager',
    'backend/modules/Searcher',
    'backend/AutoUpdater',
    'backend/Tracker',
    'modules/TabManager',
    'modules/KonamiCodeManager',
    'modules/EasterEggs',
    'jquery'
  ], function (
    React,
    ToolbarContainer,
    TopRankingContainer,
    AllTracksContainer,
    PlayerContainer,
    MenusContainer,
    HistoryContainer,
    PlaylistContainer,
    SettingsContainer,
    ConnectionCheckContainer,
    PreferenceManager,
    PlaylistManager,
    L10nManager,
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
        this._initializeDefaultLanguage();
        this._initializeDefaultSearcher();
        this._initializeKonamiCode();

        // Say hi :)
        Tracker.pageview('/').send();
      },

      _initializeDefaultLanguage: function() {
        var defaultLanguage =
          PreferenceManager.getPreference('default.language');
        L10nManager.changeLanguage(defaultLanguage);
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
                var platform = process.platform;
                var downloadLink = '';

                if (platform.match(/win32/)) {
                  downloadLink = release.download.win.link;
                }
                else if (platform.match(/darwin/)) {
                  downloadLink = release.download.mac.link;
                }
                else if (platform.match(/linux/)) {
                  downloadLink = release.download.linux.link;
                }

                if (downloadLink) {
                  shell.openExternal(downloadLink);
                  // a little delay to quit application
                  setTimeout(() => {
                    App.quit();
                  }, 1000);
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
