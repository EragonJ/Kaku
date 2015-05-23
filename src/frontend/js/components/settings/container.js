define(function(require) {
  'use strict';

  var React = require('react');
  var PreferenceManager = require('backend/PreferenceManager');
  var L10nManager = require('backend/L10nManager');

  var L10nSpan = require('components/shared/l10n-span');

  var SettingsContainer = React.createClass({
    getInitialState: function() {
      return {
        'desktop.notification.enabled': false
      };
    },

    componentDidMount: function() {
      L10nManager.getSupportedLanguages().then((languages) => {
        var defaultLanguage =
          PreferenceManager.getPreference('default.language');
        this._makeLanguageOptions(languages, defaultLanguage);
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

    _makeLanguageOptions: function(languages = [], defaultLanguage = 'en') {
      var select = this.refs.supportedLanguagesSelect.getDOMNode();
      languages.forEach((language) => {
        var option = document.createElement('option');
        option.text = language.label;
        option.value = language.lang;
        option.selected = (language.lang === defaultLanguage);
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
            <h1>
              <i className="fa fa-fw fa-cog"></i>
              <L10nSpan l10nId="settings_header"/>
              </h1>
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
                    <L10nSpan l10nId="settings_option_desktop_notificaion_enabled"/>
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
