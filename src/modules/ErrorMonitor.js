import Constants from './Constants';
import AppCore from './AppCore';
import Rollbar from 'rollbar-browser';

const env = AppCore.isDev() ? 'development' : 'production';
const rollbarConfig = {
  accessToken: Constants.API.ROLLBAR_API_KEY,
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: {
    environment: env,
  }
};

module.exports = Rollbar.init(rollbarConfig);
