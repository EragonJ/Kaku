define(function(require) {
  'use strict';

  var fs = requireNode('fs');
  var Url = requireNode('url');
  var remote = requireNode('remote');
  var path = requireNode('path');
  var App = remote.require('app');
  var AppDialog = remote.require('dialog');
  var BrowserWindow = remote.require('browser-window');

  var PreferenceManager = require('backend/modules/PreferenceManager');
  var PlaylistManager = require('backend/modules/PlaylistManager');
  var L10nManager = require('backend/modules/L10nManager');
  var Searcher = require('backend/modules/Searcher');
  var Dropbox = require('backend/modules/Dropbox');
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
        if (folderPath) {
          this._doBackupLocalDataTo(folderPath[0]);
        }
      });
    },

    _doBackupLocalDataTo: function(folderPath) {
      var backupFolderName = 'Kaku-backup';
      var backupFolderPath = path.join(folderPath, backupFolderName);

      // check folder first
      fs.lstat(backupFolderPath, (error, stats) => {
        // if no, then create
        if (error) {
          fs.mkdirSync(backupFolderPath);
        }

        var playlists = PlaylistManager.export();
        var promises = [];

        playlists.forEach((playlist) => {
          var promise = new Promise((resolve, reject) => {
            var content = JSON.stringify(playlist);
            var fileName = playlist.id + '.txt';
            var filePath = path.join(backupFolderPath, fileName);
            fs.writeFile(filePath, content, (error) => {
              // no matter success or not, we would still keep going.
              if (error) {
                console.log(error);
              }
              resolve();
            });
          });
          promises.push(promise);
        });

        Promise.all(promises).then(() => {
          Notifier.alert('Backup data to ' + folderPath + ' successfully');
        });
      });
    },

    _onClickToBackupDropboxData: function() {
      if (this._dropboxAccessToken) {
        this._doBackupDropboxData();
      }
      else {
        this._startOAuthToDropbox().then(() => {
          this._doBackupDropboxData();
        });
      }
    },

    _doBackupDropboxData: function() {
      if (this._dropboxAccessToken) {
        var rootPath = 'playlists';
        var dropboxAPI = Dropbox.api(this._dropboxAccessToken);

        // create dir
        dropboxAPI.createDir(rootPath, (error, res, body) => {
          var playlists = PlaylistManager.export();
          var promises = [];

          // create file
          playlists.forEach((playlist) => {
            var content = JSON.stringify(playlist);
            var fileName = playlist.id + '.txt';
            var filePath = path.join(rootPath, fileName);
            var promise = new Promise((resolve, reject) => {
              dropboxAPI.createFile(filePath, content, (error, res, body) => {
                if (error) {
                  reject(error);
                }
                else {
                  resolve();
                }
              });
            });
            promises.push(promise);
          });

          Promise.all(promises)
          .then(() => {
            Notifier.alert('backup data successfully :)');
          })
          .catch((error) => {
            Notifier.alert('Something went wrong, please try again');
            console.log(error);
          });
        });
      }
    },

    _startOAuthToDropbox: function() {
      var promise = new Promise((resolve, reject) => {
        Dropbox.auth().then((url) => {
          var authWindow = new BrowserWindow({
            width: 800,
            height: 600,
            'node-integration': false
          });
          authWindow.loadUrl(url);
          authWindow.show();
          authWindow.on('close', () => {
            authWindow = null;
          }, false);
          authWindow.webContents.on('did-get-redirect-request',
            (event, oldUrl, newUrl) => {
              var parsedUrl = Url.parse(newUrl);
              var hash = parsedUrl.hash;
              var matches = hash.match(/#access_token=([^&]*)/);
              var accessToken;

              // close the window
              authWindow.close();

              if (matches && matches.length > 0) {
                this._dropboxAccessToken = matches[1];
                resolve();
              }
          });
        });
      });
      return promise;
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
                this._doSyncLocalData(folderPath[0]);
              }
            });
          }, 1000);
        });
      });
    },

    _doSyncLocalData: function(folderPath) {
      // check folder first
      fs.readdir(folderPath, (error, files) => {
        if (error) {
          // TODO
          // I think we need to use fs in promise style to avoid
          // duplicate codes
          Notifier.alert('Something went wrong, please try again');
          console.log(error);
        }
        else {
          var allowedPlaylists = files.filter((fileName) => {
            return fileName.match(/.txt$/);
          });

          var promises = [];
          allowedPlaylists.forEach((playlistName) => {
            var promise = new Promise((resolve, reject) => {
              var playlistPath = path.join(folderPath, playlistName);
              fs.readFile(playlistPath, (error, content) => {
                if (error) {
                  reject(error);
                }
                else {
                  resolve(JSON.parse(content));
                }
              });
            });
            promises.push(promise);
          });

          Promise.all(promises).then((playlists) => {
            return PlaylistManager.cleanup().then(() => {
              return PlaylistManager.import(playlists);
            });
          })
          .then(() => {
            Notifier.alert('Sync data successfully :)');
          })
          .catch((error) => {
            Notifier.alert('Something went wrong, please try again');
            console.log(error);
          });
        }
      });
    },

    _onClickToSyncDropboxData: function() {
      Promise.all([
        L10nManager.get('settings_option_sync_data_confirm')
      ]).then((translations) => {
        Dialog.confirm(translations[0], (sure) => {
          if (sure) {
            if (this._dropboxAccessToken) {
              this._doSyncDropboxData();
            }
            else {
              // make UX better
              setTimeout(() => {
                this._startOAuthToDropbox().then(() => {
                  this._doSyncDropboxData();
                });
              }, 1000);
            }
          }
        });
      });
    },

    _doSyncDropboxData: function() {
      if (this._dropboxAccessToken) {
        var rootPath = '/playlists';
        var dropboxAPI = Dropbox.api(this._dropboxAccessToken);

        // get files from metadata
        dropboxAPI.getMetadata(rootPath, (error, res, metaBody) => {
          var files = metaBody.contents;
          // iterate each playlist
          var promises = files.map((file) => {
            var promise = new Promise((resolve, reject) => {
              dropboxAPI.getFile(file.path, (error, res, fileBody) => {
                if (!error) {
                  resolve(fileBody);
                }
                else {
                  reject();
                }
              });
            });
            return promise;
          });

          Promise.all(promises)
          .then((playlists) => {
            return PlaylistManager.cleanup().then(() => {
              return PlaylistManager.import(playlists);
            });
          })
          .then(() => {
            Notifier.alert('Sync data successfully :)');
          })
          .catch((error) => {
            Notifier.alert('Something went wrong, please try again');
            console.log(error);
          });
        });
      }
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
