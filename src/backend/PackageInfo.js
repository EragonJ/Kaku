define(function(require) {
  'use strict';

  var PackageInfo = function() {
    this._packageInfo = null;
  };

  PackageInfo.prototype = {
    get: function() {
      if (this._packageInfo) {
        return Promise.resolve(this._packageInfo);
      }
      else {
        var promise = new Promise((resolve) => {
          var request = new XMLHttpRequest();
          request.open('GET', 'package.json', true);
          request.onreadystatechange = () => {
            if (request.readyState === 4) {
              var packageInfo = JSON.parse(request.responseText);
              this._packageInfo = packageInfo;
              resolve(packageInfo);
            }
          };
          request.send();
        });
        return promise;
      }
    }
  };

  // singleton
  return new PackageInfo();
});
