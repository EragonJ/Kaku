define(function(require) {
  'use strict';

  var Defer = function() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  };

  return function() {
    return new Defer();
  };
});
