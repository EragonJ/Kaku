define(function(require) {
  'use strict';

  return {
    get: function() {
      return Promise.resolve({});
    },
    put: function() {
      return Promise.resolve();
    }
  };
});
