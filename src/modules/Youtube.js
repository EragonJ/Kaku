var Google = require('googleapis');
var Constants = require('./Constants');

Google.options({
  auth: Constants.API.YOUTUBE_API_KEY
});

var Youtube = Google.youtube('v3');

module.exports = Youtube;
