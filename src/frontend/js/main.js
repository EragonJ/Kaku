"use strict";

// XXX
// we have to use requirejs as entry point
requirejs([
  "react",
  "toolbar/container",
  "searchbar/container",
  "topranking/container",
  "player/container"
], function (
  React,
  ToolbarContainer,
  SearchbarContainer,
  TopRankingContainer,
  PlayerContainer
) {

  // slots list
  var toolbarSlot = document.querySelector(".toolbar-slot");
  var searchbarSlot = document.querySelector(".searchbar-slot");
  var toprankingSlot = document.querySelector(".topranking-slot");
  var playerSlot = document.querySelector(".player-slot");

  // render list
  React.render(ToolbarContainer, toolbarSlot);
  React.render(SearchbarContainer, searchbarSlot);
  React.render(TopRankingContainer, toprankingSlot);
  React.render(PlayerContainer, playerSlot);
});
