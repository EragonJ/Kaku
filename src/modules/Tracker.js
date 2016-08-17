const Constants = require('./Constants');
const Ua = require('universal-analytics');
const Visitor = Ua(Constants.GA.RESOURCE_KEY);

module.exports = Visitor;
