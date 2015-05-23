define(function(require) {
  'use strict';

  var PreferenceManager = require('backend/PreferenceManager');
  var L10nManager = require('backend/L10nManager');
  var React = require('react');

  var SettingsContainer = React.createClass({
    getInitialState: function() {
      return {
        'desktop.notification.enabled': false
      };
    },

    componentDidMount: function() {
      L10nManager.init();
      L10nManager.getSupportedLanguages().then((languages) => {
        this._makeLanguageOptions(languages);

        // we have to dynamically change to related language
        PreferenceManager.getPreference('default.language', (language) => {
          // TODO 
        });
      });

      PreferenceManager.on('preference-updated', (key, newPreference) => {
        var obj = {};
        obj[key] = newPreference;
        this.setState(obj);
      });

      L10nManager.on('language-changed', (newLanguage) => {
        PreferenceManager.setPreference('default.language', newLanguage);
      });
    },

    _makeLanguageOptions: function(languages = []) {
      var select = this.refs.supportedLanguagesSelect.getDOMNode();
      languages.forEach((language) => {
        var option = document.createElement('option');
        option.text = language.label;
        option.value = language.lang;
        select.add(option);
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

    _onLanguageChange: function(event) {
      var language = event.target.value;
      L10nManager.changeLanguage(language);
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
              <li>
                <select onChange={this._onLanguageChange} ref="supportedLanguagesSelect"></select>
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
