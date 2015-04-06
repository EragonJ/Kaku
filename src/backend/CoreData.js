define(function(require) {
  var Watch = requireNode('watchjs');
  var watch = Watch.watch;
  var unwatch = Watch.unwatch;

  var CoreData = {
    currentTrack: {},
    currentTab: 'home',
    // TODO
    // deprecate currentSong later
    currentSong: {
      coverUrl: '',
      title: '',
      artist: '',
    },
    searchResults: []
  };

  return {
    set: function(key, value) {
      CoreData[key] = value;
    },
    watch: watch.bind({}, CoreData),
    unwatch: unwatch.bind({}, CoreData)
  };
});
