var Youtube = require('youtube-api');
var Constants = require('./Constants');

Youtube.authenticate({
  type: 'key',
  key: Constants.API.YOUTUBE_API_KEY
});

module.exports = Youtube;
