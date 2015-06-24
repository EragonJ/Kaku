define(function(require) {
  'use strict';
  
  var Constants = require('backend/Constants');
  var ua = requireNode('universal-analytics');
  var visitor = ua(Constants.GA.RESOURCE_KEY);

  return visitor;
});
