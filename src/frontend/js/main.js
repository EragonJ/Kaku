'use strict';

requirejs([
  'react',
  'toolbar/container',
  'searchbar/container',
  'topranking/container',
  'alltracks/container',
  'player/container'
], function (
  React,
  ToolbarContainer,
  SearchbarContainer,
  TopRankingContainer,
  AllTracksContainer,
  PlayerContainer
) {
  var KakuApp = React.createClass({
    render: function() {
      return (
        <div className="root">
          <div className="toolbar-slot">
            <ToolbarContainer/>
          </div>
          <div className="main-container clearfix">
            <div className="sidebar-container">
              <div className="player-slot">
                <PlayerContainer/>
              </div>
            </div>
            <div className="content-container">
              <div className="searchbar-slot">
                <SearchbarContainer/>
              </div>
              <div className="topranking-slot">
                <TopRankingContainer/>
              </div>
              <div className="alltracks-slot">
                <AllTracksContainer/>
              </div>
            </div>
          </div>
        </div>
      );
    }
  });

  React.renderComponent(<KakuApp/>, document.body);
});
