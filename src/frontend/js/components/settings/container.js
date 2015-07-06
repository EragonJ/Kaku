define(function(require) {
  'use strict';

  var React = require('react');
  var Searcher = require('backend/modules/Searcher');
  var PreferenceManager = require('backend/modules/PreferenceManager');
  var L10nManager = require('backend/modules/L10nManager');

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

      Searcher.getSupportedSearchers().then((searchers) => {
        var defaultSearcher =
          PreferenceManager.getPreference('default.searcher');
        this._makeSearcherOptions(searchers, defaultSearcher);
      });

      PreferenceManager.on('preference-updated', (key, newPreference) => {
        var obj = {};
        obj[key] = newPreference;
        this.setState(obj);
      });

      L10nManager.on('language-changed', (newLanguage) => {
        PreferenceManager.setPreference('default.language', newLanguage);
      });

      Searcher.on('searcher-changed', (newSearcher) => {
        PreferenceManager.setPreference('default.searcher', newSearcher);
      });
    },

    _makeLanguageOptions: function(languages, defaultLanguage) {
      languages = languages || [];
      defaultLanguage = defaultLanguage || 'en';

      var select = this.refs.supportedLanguagesSelect.getDOMNode();
      languages.forEach((language) => {
        var option = document.createElement('option');
        option.text = language.label;
        option.value = language.lang;
        option.selected = (language.lang === defaultLanguage);
        select.add(option);
      });
    },

    _makeSearcherOptions: function(searchers, defaultSearcher) {
      searchers = searchers || [];
      defaultSearcher = defaultSearcher || 'youtube';

      var select = this.refs.supportedSearcherSelect.getDOMNode();
      searchers.forEach((searcherName) => {
        var option = document.createElement('option');
        option.text = searcherName;
        option.value = searcherName;
        option.selected = (searcherName === defaultSearcher);
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

    _onSearcherChange: function(event) {
      var searcherName = event.target.value;
      Searcher.changeSearcher(searcherName);
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
            <form className="form-horizontal">
              <div className="form-group">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="settings_option_desktop_notificaion_enabled"/>
                </label>
                <div className="col-sm-3">
                  <div className="checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={isDesktopNotificationEnabled}
                        data-key="desktop.notification.enabled"
                        onChange={this._onCheckboxChange}/>
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="settings_option_default_language"/>
                </label>
                <div className="col-sm-3">
                  <select
                    className="form-control"
                    onChange={this._onLanguageChange}
                    ref="supportedLanguagesSelect">
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="settings_option_default_searcher"/>
                </label>
                <div className="col-sm-3">
                  <select
                    className="form-control"
                    onChange={this._onSearcherChange}
                    ref="supportedSearcherSelect"></select>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return SettingsContainer;
});
