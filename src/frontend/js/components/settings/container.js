define(function(require) {
  'use strict';

  var remote = requireNode('remote');
  var path = requireNode('path');
  var App = remote.require('app');
  var AppDialog = remote.require('dialog');

  var PreferenceManager = require('backend/modules/PreferenceManager');
  var PlaylistManager = require('backend/modules/PlaylistManager');

  var DropboxBackuper = require('backend/modules/backuper/DropboxBackuper');
  var LocalBackuper = require('backend/modules/backuper/LocalBackuper');

  var L10nManager = require('backend/modules/L10nManager');
  var Searcher = require('backend/modules/Searcher');
  var DB = require('backend/modules/Database');
  var React = require('react');

  var L10nSpan = require('components/shared/l10n-span');
  var Notifier = require('modules/Notifier');
  var Dialog = require('modules/Dialog');

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

    _onFormSubmit: function(event) {
      event.preventDefault();
    },

    _onClickToBackupLocalData: function() {
      AppDialog.showOpenDialog({
        title: 'Where to backup your track ?',
        properties: ['openDirectory']
      }, (folderPath) => {
        Notifier.alert('Start to backup data !');

        var playlists = PlaylistManager.export();
        LocalBackuper.backup(playlists, {
          basePath: folderPath[0],
          folderName: 'kaku-backup'
        }).then(() => {
          Notifier.alert('backup data successfully :)');
        }).catch((error) => {
          Notifier.alert('Something went wrong, please try again');
          console.log(error);
        });
      });
    },

    _onClickToBackupDropboxData: function() {
      var playlists = PlaylistManager.export();
      Notifier.alert('Start to backup data !');

      DropboxBackuper.backup(playlists, {
        folderName: 'playlists'
      }).then(() => {
        Notifier.alert('backup data successfully :)');
      }).catch((error) => {
        Notifier.alert('Something went wrong, please try again');
        console.log(error);
      });
    },

    _onClickToSyncLocalData: function() {
      Promise.all([
        L10nManager.get('settings_option_sync_data_confirm')
      ]).then((translations) => {
        Dialog.confirm(translations[0], (sure) => {
          // make UX better
          setTimeout(() => {
            AppDialog.showOpenDialog({
              title: 'Where is your backup file ?',
              properties: ['openDirectory']
            }, (folderPath) => {
              if (folderPath) {
                Notifier.alert('Start to sync data !');

                LocalBackuper.syncDataBack({
                  folderPath: folderPath[0]
                }).then((playlists) => {
                  return PlaylistManager.cleanup().then(() => {
                    return PlaylistManager.import(playlists);
                  });
                }).then(() => {
                  Notifier.alert('Sync data successfully :)');
                }).catch((error) => {
                  Notifier.alert('Something went wrong, please try again');
                  console.log(error);
                });
              }
            });
          }, 1000);
        });
      });
    },

    _onClickToSyncDropboxData: function() {
      Promise.all([
        L10nManager.get('settings_option_sync_data_confirm')
      ]).then((translations) => {
        Dialog.confirm(translations[0], (sure) => {
          if (sure) {
            Notifier.alert('Start to sync data !');

            // make UX better
            setTimeout(() => {
              // start to sync data from Dropbox
              DropboxBackuper.syncDataBack({
                folderPath: '/playlists'
              }).then((playlists) => {
                return PlaylistManager.cleanup().then(() => {
                  return PlaylistManager.import(playlists);
                });
              }).then(() => {
                Notifier.alert('Sync data successfully :)');
              }).catch((error) => {
                Notifier.alert('Something went wrong, please try again');
                console.log(error);
              });
            }, 1000);
          }
        });
      });
    },

    _onClickToResetDatabse: function() {
      Promise.all([
        L10nManager.get('settings_option_reset_database_confirm')
      ]).then((translations) => {
        Dialog.confirm(translations[0], (sure) => {
          if (sure) {
            DB.resetDatabase().then(() => {
              remote.getCurrentWindow().reload();
            });
          }
        });
      });
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
            <form className="form-horizontal" onSubmit={this._onFormSubmit}>
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
              <div className="form-group">
                <label className="col-sm-3 control-label">
                  <L10nSpan l10nId="settings_option_backup"/>
                </label>
                <div className="col-sm-6">
                  <div className="btn-group" role="group">
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-default dropdown-toggle"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false">
                          <L10nSpan l10nId="settings_option_choose_backup_method"/>
                          &nbsp;
                          <span className="caret"></span>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <a href="#" onClick={this._onClickToBackupLocalData}>
                            <i className="fa fa-fw fa-desktop"></i>
                            <L10nSpan l10nId="settings_option_backup_to_local"/>
                          </a>
                        </li>
                        <li>
                          <a href="#" onClick={this._onClickToBackupDropboxData}>
                            <i className="fa fa-fw fa-dropbox"></i>
                            <L10nSpan l10nId="settings_option_backup_to_dropbox"/>
                          </a>
                        </li>
                        <li className="divider" role="separator"></li>
                        <li>
                          <a href="#" onClick={this._onClickToSyncLocalData}>
                            <i className="fa fa-fw fa-desktop"></i>
                            <L10nSpan l10nId="settings_option_sync_data_from_local"/>
                          </a>
                        </li>
                        <li>
                          <a href="#" onClick={this._onClickToSyncDropboxData}>
                            <i className="fa fa-fw fa-dropbox"></i>
                            <L10nSpan l10nId="settings_option_sync_data_from_dropbox"/>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <div className="col-sm-offset-3 col-sm-3">
                  <button
                    className="btn btn-danger"
                    onClick={this._onClickToResetDatabse}>
                      <L10nSpan l10nId="settings_option_reset_database"/>
                  </button>
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
