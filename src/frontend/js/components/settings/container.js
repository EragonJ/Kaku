define(function(require) {
  'use strict';

  var PreferenceManager = require('backend/PreferenceManager');
  var React = require('react');

  var SettingsContainer = React.createClass({
    getInitialState: function() {
      return {
        'desktop.notification.enabled': false
      };
    },

    componentDidMount: function() {
      PreferenceManager.on('preference-updated', (key, newPreference) => {
        var obj = {};
        obj[key] = newPreference;
        this.setState(obj);
      });
    },

    _onCheckboxChange: function(event) {
      var target = event.target;
      var enabled = target.checked;
      var key = target.dataset.key;

      if (key) {
        PreferenceManager.setPreference(key, enabled);
      }
    },

    render: function() {
      var isDesktopNotificationEnabled =
        PreferenceManager.getPreference('desktop.notification.enabled');

      /* jshint ignore:start */
      return (
        <div className="settings-slot">
          <div className="header clearfix">
            <h1><i className="fa fa-fw fa-cog"></i>Settings</h1>
          </div>
          <div className="settings-container">
            <ul className="list-unstyled">
              <li>
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isDesktopNotificationEnabled}
                      data-key="desktop.notification.enabled"
                      onChange={this._onCheckboxChange}/>
                        Enable Desktop Notification
                  </label>
                </div>
              </li>
            </ul>
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return SettingsContainer;
});
