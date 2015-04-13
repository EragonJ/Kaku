define(function(require) {
  var Watch = requireNode('watchjs');
  var watch = Watch.watch;
  var unwatch = Watch.unwatch;

  var CoreData = {
    currentTrack: {},
    currentTab: 'home',
    playedTracks: [],
    searchResults: []
  };

  return {
    get: function(key) {
      var target = CoreData[key];
      // Because watchjs would wrap, we should make them into a simple array
      if (Object.prototype.toString.call(target) === '[object Array]') {
        return target.slice();
      }
      else {
        return target;
      }
    },
    set: function(key, value) {
      CoreData[key] = value;
    },
    watch: watch.bind({}, CoreData),
    unwatch: unwatch.bind({}, CoreData)
  };
});
