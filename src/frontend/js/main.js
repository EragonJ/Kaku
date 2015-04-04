'use strict';

requirejs([
  'react',
  'toolbar/container',
  'topranking/container',
  'alltracks/container',
  'player/container'
], function (
  React,
  ToolbarContainer,
  TopRankingContainer,
  AllTracksContainer,
  PlayerContainer
) {
  var KakuApp = React.createClass({
    render: function() {
      return (
        <div className="root">
          <div className="row row-no-padding">
            <div className="col-md-12">
              <div className="toolbar-slot">
                <ToolbarContainer/>
              </div>
            </div>
          </div>
          <div className="row row-no-padding">
            <div className="col-md-3">
              <div className="player-slot">
                <PlayerContainer/>
              </div>
            </div>
            <div className="col-md-9">
              <h1>Top Rankings</h1>
              <div className="topranking-slot">
                <TopRankingContainer/>
              </div>
            </div>
          </div>
          <div className="main-container clearfix">
            <div className="sidebar-container">
            </div>
            <div className="content-container">
              <div className="alltracks-slot">
                <AllTracksContainer/>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  React.render(<KakuApp/>, document.body);
});
