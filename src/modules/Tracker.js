var Constants = require('./Constants');
var Ua = require('universal-analytics');
var Visitor = Ua(Constants.GA.RESOURCE_KEY);

module.exports = Visitor;
