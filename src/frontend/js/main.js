// XXX
// we have to use requirejs as entry point
requirejs([
  'react',
  'components/toolbar/container',
  'components/searchbar/container',
  'components/topranking/container'
], function(React, ToolbarContainer, SearchbarContainer, TopRankingContainer) {

  // slots list
  var toolbarSlot = document.querySelector('.toolbar-slot');
  var searchbarSlot = document.querySelector('.searchbar-slot');
  var toprankingSlot = document.querySelector('.topranking-slot');

  // render list
  React.render(ToolbarContainer, toolbarSlot);
  React.render(SearchbarContainer, searchbarSlot);
  React.render(TopRankingContainer, toprankingSlot);
});
