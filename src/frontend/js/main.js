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
    'backend/PlaylistManager',
    'modules/TabManager',
    'backend/AutoUpdater',
    'jquery',
    'bootstrap'
  ], function (
    React,
    ToolbarContainer,
    TopRankingContainer,
    AllTracksContainer,
    PlayerContainer,
    MenusContainer,
    HistoryContainer,
    PlaylistContainer,
    PlaylistManager,
    TabManager,
    AutoUpdater
  ) {
    var KakuApp = React.createClass({
      componentDidMount: function() {
        // TODO
        // I have to do more tests on this
        // this._triggerUpdatorAfter5seconds();
      },

      _triggerUpdatorAfter5seconds: function() {
        setTimeout(function() {
          AutoUpdater.run();
        }, 5000);
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
    React.render(<KakuApp/>, document.body);
    /* jshint ignore:end */
  });
});
