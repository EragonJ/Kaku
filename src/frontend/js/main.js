'use strict';

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
    'toolbar/container',
    'topranking/container',
    'alltracks/container',
    'player/container',
    'menus/container',
    'jquery',
    'bootstrap'
  ], function (
    React,
    ToolbarContainer,
    TopRankingContainer,
    AllTracksContainer,
    PlayerContainer,
    MenusContainer
  ) {
    var KakuApp = React.createClass({
      render: function() {
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
                <div className="main-content">
                  <div className="tab-content">
                    <div
                      role="tabpanel"
                      className="tab-pane active"
                      id="tab-home">
                        <h1>Top Rankings</h1>
                        <div className="topranking-slot">
                          <TopRankingContainer/>
                        </div>
                    </div>
                    <div role="tabpanel" className="tab-pane" id="tab-search">
                      <div className="alltracks-slot">
                        <AllTracksContainer/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    });
    React.render(<KakuApp/>, document.body);
  });
});
