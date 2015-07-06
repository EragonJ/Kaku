define(function(require) {
  'use strict';

  var PreferenceManager = require('backend/modules/PreferenceManager');
  var $ = require('jquery');
  var _ = require('notify');

  var EventEmitter = requireNode('events').EventEmitter;

  var Notifier = function() {
    EventEmitter.call(this);
  };

  Notifier.prototype = Object.create(EventEmitter.prototype);
  Notifier.constructor = Notifier;

  Notifier.prototype._getDefaultNotifyOptions = function() {
    return {
      placement: {
        from: 'bottom',
        align: 'right'
      }
    };
  };

  Notifier.prototype._getProcessedArguments = function() {
    var args = arguments;
    var firstOption = {};
    var secondOption = this._getDefaultNotifyOptions();

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
  };

  Notifier.prototype.alert = function() {
    var args = this._getProcessedArguments.apply(this, arguments);
    $.notify(args[0], args[1]);
  };

  Notifier.prototype.sendDesktopNotification = function(options) {
    var isDesktopNotificationEnabled =
      PreferenceManager.getPreference('desktop.notification.enabled');
    // TODO
    // 1. add more checks here
    // 2. change default kaku icon
    if (isDesktopNotificationEnabled && options.body) {
      var title = options.title || 'Love from Kaku';
      var notification = new window.Notification(title, options);
    }
  };

  return new Notifier();
});
