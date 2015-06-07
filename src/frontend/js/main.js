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
    'backend/PreferenceManager',
    'backend/PlaylistManager',
    'backend/L10nManager',
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
    PreferenceManager,
    PlaylistManager,
    L10nManager,
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

    var KakuApp = React.createClass({
      componentWillMount: function() {
        this._hideLoadingPage();
      },

      componentDidMount: function() {
        this._triggerAutoUpdater();
        this._initializeDefaultLanguage();
        this._initializeKonamiCode();
      },

      _initializeDefaultLanguage: function() {
        var defaultLanguage =
          PreferenceManager.getPreference('default.language');
        L10nManager.changeLanguage(defaultLanguage);
      },

      _initializeKonamiCode: function() {
        KonamiCodeManager.attach(document.body, () => {
          EasterEggs.show();
        });
      },

      _triggerAutoUpdater: function() {
        // TODO
        // we have to enable AutoUpdater here later
      },

      _hideLoadingPage: function() {
        // for better UX
        loadingPageDOM.hidden = true;
      },

      render: function() {
        /* jshint ignore:start */
        return (
          <div className="root">
            <div className="row row-no-padding top-row">
              <div className="col-md-12">
                <div className="toolbar-slot">
                  <ToolbarContainer/>
                </div>
              </div>
            </div>
            <div className="row row-no-padding bottom-row">
              <div className="col col-md-3">
                <div className="sidebar">
                  <MenusContainer/>
                  <PlayerContainer/>
                </div>
              </div>
              <div className="col col-md-9">
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
