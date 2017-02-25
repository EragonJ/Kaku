import $ from 'jquery';
import Bootstrap from 'bootstrap';
import BootstrapNotify from 'bootstrap-notify';

import { EventEmitter } from 'events';
import PreferenceManager from '../../modules/PreferenceManager';

class Notifier extends EventEmitter {
  constructor() {
    super();
  }

  _getDefaultNotifyOptions() {
    return {
      placement: {
        from: 'bottom',
        align: 'right'
      }
    };
  }

  _getProcessedArguments() {
    const args = arguments;
    const secondOption = this._getDefaultNotifyOptions();
    let firstOption = {};

    if (args.length <= 0 || args.length > 2) {
      throw new Error('you are passing wrong parameters into Notifier');
    }

    // We assume String type means `message`
    if (typeof args[0] === 'string') {
      firstOption.message = args[0];
    }

    // If it is Object type, good, just override it
    if (typeof args[0] === 'object') {
      firstOption = args[0];
    }

    // If we are passing two parameters, because we already handled
    // args[0], so what we have to do here is handle args[1]
    if (args.length === 2) {
      Object.keys(args[1]).each((key) => {
        secondOption[key] = args[1][key];
      });
    }

    return [firstOption, secondOption];
  }

  alert() {
    const args = this._getProcessedArguments(...arguments);
    $.notify(args[0], args[1]);
  }

  sendDesktopNotification(options) {
    const isDesktopNotificationEnabled =
      PreferenceManager.getPreference('desktop.notification.enabled');
    // TODO
    // 1. add more checks here
    // 2. change default kaku icon
    if (isDesktopNotificationEnabled && options.body) {
      const title = options.title || 'Love from Kaku';
      const notification = new window.Notification(title, options);
    }
  }
}

module.exports = new Notifier();
