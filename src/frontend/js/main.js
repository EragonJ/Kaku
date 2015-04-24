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
      getInitialState: function() {
        return {
          currentPlaylist: {}
        };
      },

      componentDidMount: function() {
        // TODO
        // I have to do more tests on this
        // this._triggerUpdatorAfter5seconds();

        PlaylistManager.on('renamed', (playlist) => {
          if (playlist.id === this.state.currentPlaylist.id) {
            this._refreshInternalState(playlist);
          }
        });

        TabManager.on('changed', (tabName, tabOptions) => {
          if (tabName === 'playlist') {
            var playlistId = tabOptions;
            var playlist = PlaylistManager.findPlaylistById(playlistId);
            this._refreshInternalState(playlist);
          }
        });
      },

      _triggerUpdatorAfter5seconds: function() {
        setTimeout(function() {
          AutoUpdater.run();
        }, 5000);
      },

      _refreshInternalState: function(playlist) {
        this.setState({
          currentPlaylist: playlist
        });
      },

      render: function() {
        var currentPlaylistName = this.state.currentPlaylist.name || '';

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
                      <h1><i className="fa fa-fw fa-line-chart"></i>Top Rankings</h1>
                      <div className="topranking-slot">
                        <TopRankingContainer/>
                      </div>
                  </div>
                  <div
                    role="tabpanel"
                    className="tab-pane"
                    id="tab-search">
                      <h1><i className="fa fa-fw fa-search"></i>Search Results</h1>
                      <div className="alltracks-slot">
                        <AllTracksContainer/>
                      </div>
                  </div>
                  <div
                    role="tabpanel"
                    className="tab-pane"
                    id="tab-history">
                      <h1><i className="fa fa-fw fa-history"></i>Histories</h1>
                      <div className="histories-slot">
                        <HistoryContainer/>
                      </div>
                  </div>
                  <div
                    role="tabpanel"
                    className="tab-pane"
                    id="tab-playlist">
                      <h1><i className="fa fa-fw fa-music"></i>{currentPlaylistName}</h1>
                      <div className="playlist-slot">
                        <PlaylistContainer/>
                      </div>
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
