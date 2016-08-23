var Electron = require('electron');
var Remote = Electron.remote;
var App = Remote.app;
var AppDialog = Remote.dialog;

var React = require('react');

var PreferenceManager = require('../../../modules/PreferenceManager');
var TrackInfoFetcher = require('kaku-core/modules/TrackInfoFetcher');
var PlaylistManager = require('../../../modules/PlaylistManager');
var YoutubeImporter = require('../../../modules/importer/YoutubeImporter');
var DropboxBackuper = require('../../../modules/backuper/DropboxBackuper');
var LocalBackuper = require('../../../modules/backuper/LocalBackuper');
var AutoUpdater = require('../../../modules/AutoUpdater');
var TopRanking = require('kaku-core/modules/TopRanking');

var L10nManager = require('../../../modules/L10nManager');
var Searcher = require('../../../modules/Searcher');
var DB = require('../../../modules/Database');
var _ = L10nManager.get.bind(L10nManager);

var L10nSpan = require('../shared/l10n-span');
var Notifier = require('../../modules/Notifier');
var Dialog = require('../../modules/Dialog');

var SettingsComponent = React.createClass({
  getInitialState: function() {
    return {
      'desktop.notification.enabled': false
    };
  },

  componentDidMount: function() {
    // Country
    var countryData = TopRanking.getCountryList();
    var defaultCountryCode =
      PreferenceManager.getPreference('default.topRanking.countryCode');
    this._makeTopRankingOptions(countryData, defaultCountryCode);

    // Languages
    var languages = L10nManager.getSupportedLanguages();
    var defaultLanguage = PreferenceManager.getPreference('default.language');
    this._makeLanguageOptions(languages, defaultLanguage);

    // Track Format
    this._buildTrackFormatOptions();

    // Searchers
    Searcher.getSupportedSearchers().then((searchers) => {
      var defaultSearcher =
        PreferenceManager.getPreference('default.searcher');
      this._makeSearcherOptions(searchers, defaultSearcher);
    });

    // Events
    PreferenceManager.on('preference-updated', (key, newPreference) => {
      var obj = {};
      obj[key] = newPreference;
      this.setState(obj);
    });

    L10nManager.on('language-changed', (newLanguage) => {
      PreferenceManager.setPreference('default.language', newLanguage);

      // We need to rebuild options when language is changed
      this._buildTrackFormatOptions();
    });

    Searcher.on('searcher-changed', (newSearcher) => {
      PreferenceManager.setPreference('default.searcher', newSearcher);
    });

    TopRanking.on('topRanking-changed', (newCountryCode) => {
      PreferenceManager.setPreference('default.topRanking.countryCode',
        newCountryCode);
    });

    TrackInfoFetcher.on('format-changed', (newFormat) => {
      PreferenceManager.setPreference('default.track.format', newFormat);
    });

    PreferenceManager.on('preference-updated', (key, newPreference) => {
      if (key === 'default.alwaysOnTop.enabled') {
        Remote.getCurrentWindow().setAlwaysOnTop(newPreference);
      }
    });
  },

  _makeLanguageOptions: function(languages, defaultLanguage) {
    languages = languages || [];
    defaultLanguage = defaultLanguage || 'en';

    var select = this.refs.supportedLanguagesSelect;
    languages.forEach((language) => {
      var option = document.createElement('option');
      option.text = language.label;
      option.value = language.lang;
      option.selected = (language.lang === defaultLanguage);
      select.add(option);
    });
  },

  _makeTopRankingOptions: function(countryData, defaultCountryCode) {
    var select = this.refs.topRankingSelect;
    Object.keys(countryData).forEach((countryCode) => {
      var option = document.createElement('option');
      option.text = countryData[countryCode];
      option.value = countryCode;
      option.selected = (defaultCountryCode === countryCode);
      select.add(option);
    });
  },

  _makeSearcherOptions: function(searchers, defaultSearcher) {
    searchers = searchers || [];
    defaultSearcher = defaultSearcher || 'youtube';

    let select = this.refs.supportedSearcherSelect;
    searchers.forEach((searcherName) => {
      let option = document.createElement('option');
      let l10nId = `settings_option_searcher_${searcherName}`;

      option.text = _(l10nId);
      option.value = searcherName;
      option.selected = (searcherName === defaultSearcher);
      select.add(option);
    });
  },

  _buildTrackFormatOptions: function() {
    var trackFormats = TrackInfoFetcher.getSupportedFormats();
    var defaultFormat =
      PreferenceManager.getPreference('default.track.format') || 'best';
    var select = this.refs.trackFormatSelect;

    // remove childrens first
    while (select.lastChild) {
      select.removeChild(select.lastChild);
    }

    // then build
    trackFormats.forEach((format) => {
      var option = document.createElement('option');
      option.text = _(format.l10nId);
      option.value = format.value;
      option.selected = (format.value === defaultFormat);
      select.add(option);
    });
  },

  _onChangeToSetPreference: function(event) {
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

  _onTopRankingChange: function(event) {
    var countryCode = event.target.value;
    TopRanking.changeCountry(countryCode);
  },

  _onSearcherChange: function(event) {
    var searcherName = event.target.value;
    Searcher.changeSearcher(searcherName);
  },

  _onTrackFormatChange: function(event) {
    var trackFormat = event.target.value;
    TrackInfoFetcher.changeFormat(trackFormat);
  },

  _onClickToImportYoutubePlaylist: function() {
    Dialog.prompt({
      title: _('settings_option_enter_playlist_url_prompt'),
      value: '',
      callback: (url) => {
        if (url) {
          YoutubeImporter.import(url).then((playlist) => {
            Notifier.alert(playlist.name + ' is created !');
          }).catch((error) => {
            Notifier.alert(error);
            console.log(error);
          });
        }
      }
    });
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
    Dialog.confirm(
      _('settings_option_sync_data_confirm'),
      (sure) => {
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
  },

  _onClickToSyncDropboxData: function() {
    Dialog.confirm(
      _('settings_option_sync_data_confirm'),
      (sure) => {
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
  },

  _onClickToUpdatePlayer: function() {
    Notifier.alert('Start to update, please don\'t play music when updating');

    AutoUpdater.updateYoutubeDl().then(() => {
      Notifier.alert('Success ! You are good to go now :)');
    }).catch((error) => {
      Notifier.alert('Something went wrong when updating');
      console.log(error);
    });
  },

  _onClickToResetDatabse: function() {
    Dialog.confirm(
      _('settings_option_reset_database_confirm'),
      (sure) => {
        if (sure) {
          DB.resetDatabase().then(() => {
            Remote.getCurrentWindow().reload();
          });
        }
    });
  },

  render: function() {
    var isDesktopNotificationEnabled =
      PreferenceManager.getPreference('desktop.notification.enabled');

    var isAlwaysOnTopEnabled =
      PreferenceManager.getPreference('default.alwaysOnTop.enabled');

    /* jshint ignore:start */
    return (
      <div className="settings-slot">
        <div className="header clearfix">
          <h1>
            <i className="fa fa-fw fa-cog"></i>
            <L10nSpan l10nId="settings_header"/>
          </h1>
        </div>
        <div className="settings-component">
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
                      onChange={this._onChangeToSetPreference}/>
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="settings_option_always_on_top_enabled"/>
              </label>
              <div className="col-sm-3">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isAlwaysOnTopEnabled}
                      data-key="default.alwaysOnTop.enabled"
                      onChange={this._onChangeToSetPreference}/>
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
                <L10nSpan l10nId="settings_option_default_top_ranking_country"/>
              </label>
              <div className="col-sm-3">
                <select
                  className="form-control"
                  onChange={this._onTopRankingChange}
                  ref="topRankingSelect">
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
                <L10nSpan l10nId="settings_option_default_track_format"/>
              </label>
              <div className="col-sm-3">
                <select
                  className="form-control"
                  onChange={this._onTrackFormatChange}
                  ref="trackFormatSelect"></select>
              </div>
            </div>
            <div className="form-group">
              <label className="col-sm-3 control-label">
                <L10nSpan l10nId="settings_option_import_playlist"/>
              </label>
              <div className="col-sm-6">
                <div className="btn-group" role="group">
                  <div className="btn-group" role="group">
                    <button
                      className="btn btn-default dropdown-toggle"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false">
                        <L10nSpan l10nId="settings_option_choose_import_playlist_method"/>
                        <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu">
                      <li>
                        <a href="#" onClick={this._onClickToImportYoutubePlaylist}>
                          <i className="fa fa-fw fa-youtube"></i>
                          <L10nSpan l10nId="settings_option_import_youtube_playlist"/>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
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
                  className="btn btn-primary"
                  onClick={this._onClickToUpdatePlayer}>
                    <L10nSpan l10nId="settings_option_update_player"/>
                </button>
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

module.exports = SettingsComponent;
