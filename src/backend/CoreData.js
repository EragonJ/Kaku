define(function(require) {
  var Cortex = requireNode('cortexjs');
  var CoreData = new Cortex({
    currentSong: {
      coverUrl: '',
      title: '',
      artist: '',
    },
    searchResults: []
  });

  return CoreData;
});
