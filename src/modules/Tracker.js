import Constants from './Constants';
import Ua from 'universal-analytics';
const Visitor = Ua(Constants.GA.RESOURCE_KEY);

module.exports = Visitor;
