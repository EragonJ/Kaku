let Constants = {};

try {
  Constants.API = require('../../config/api_config.production.json');
  Constants.GA = require('../../config/ga_config.json');
}
catch(e) {
  Constants.API = {};
  Constants.GA = {};
}

Constants.KEY_MAP = {
  8: 'DELETE',
  13: 'ENTER',
  32: 'SPACE',
  27: 'ESC',
  37: 'ARROW_LEFT',
  38: 'ARROW_UP',
  39: 'ARROW_RIGHT',
  40: 'ARROW_DOWN'
};

// If users forget to change from *.sample.json to *.production.json,
// require will throw out error here, because if we don't have these
// configs here, our program will be broken somehow. In this way, we should
// make sure it does exist before running Kaku.
module.exports = Constants;
