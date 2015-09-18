var Constants = require('./Constants');
var Youtube = require('youtube-node');

var youtube = new Youtube();
youtube.setKey(Constants.API.YOUTUBE_API_KEY);

module.exports = youtube;
