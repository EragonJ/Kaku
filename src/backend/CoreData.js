define(function(require) {
  'use strict';

  var dataPath = process.cwd();
  var serialize = requireNode('serialize-javascript');
  var Watch = requireNode('watchjs');
  var fs = requireNode('fs');
  var watch = Watch.watch;
  var unwatch = Watch.unwatch;

  var storageFile = dataPath + '/core_data';

  var CoreData = {
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
    unwatch: unwatch.bind({}, CoreData),
    export: function() {
      console.log(storageFile);
      var promise = new Promise((resolve, reject) => {
        var result = serialize(CoreData);
        fs.writeFile(storageFile, result, (error) => {
          if (error) {
            reject(error);
          }
          else {
            resolve();
          }
        });
      });
      return promise;
    },
    import: function() {
      var promise = new Promise((resolve, reject) => {
        fs.readFile(storageFile, (error, content) => {
          if (error) {
            reject(error);
          }
          else {
            CoreData = JSON.parse(content);
            resolve();
          }
        });
      });
      return promise;
    }
  };
});
