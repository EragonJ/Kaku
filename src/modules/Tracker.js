var Constants = require('./Constants');
var ua = require('universal-analytics');
var visitor = ua(Constants.GA.RESOURCE_KEY);

module.exports = visitor;
