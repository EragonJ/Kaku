import React, { Component } from 'react';
import Electron from 'electron';

import PreferenceManager from '../../../modules/PreferenceManager';
import TrackInfoFetcher from 'kaku-core/modules/TrackInfoFetcher';
import PlaylistManager from '../../../modules/PlaylistManager';
import YoutubeImporter from '../../../modules/importer/YoutubeImporter';
import DropboxBackuper from '../../../modules/backuper/DropboxBackuper';
import LocalBackuper from '../../../modules/backuper/LocalBackuper';
import AutoUpdater from '../../../modules/AutoUpdater';
import TopRanking from 'kaku-core/modules/TopRanking';

import L10nManager from '../../../modules/L10nManager';
import Searcher from '../../../modules/Searcher';
import DB from '../../../modules/Database';


import L10nSpan from '../shared/l10n-span';
import Notifier from '../../modules/Notifier';
import Dialog from '../../modules/Dialog';

const Remote = Electron.remote;
const App = Remote.app;
const AppDialog = Remote.dialog;
const _ = L10nManager.get.bind(L10nManager);

class SettingsComponent extends Component {
  constructor(props) {
    super(props);

    this._makeLanguageOptions = this._makeLanguageOptions.bind(this);
    this._makeTopRankingOptions = this._makeTopRankingOptions.bind(this);
    this._makeSearcherOptions = this._makeSearcherOptions.bind(this);
    this._buildTrackFormatOptions = this._buildTrackFormatOptions.bind(this);
    this._onChangeToSetPreference = this._onChangeToSetPreference.bind(this);
    this._onLanguageChange = this._onLanguageChange.bind(this);
    this._onTopRankingChange = this._onTopRankingChange.bind(this);
    this._onSearcherChange = this._onSearcherChange.bind(this);
    this._onTrackFormatChange = this._onTrackFormatChange.bind(this);
    this._onClickToImportYoutubePlaylist = this._onClickToImportYoutubePlaylist.bind(this);
    this._onFormSubmit = this._onFormSubmit.bind(this);
    this._onClickToBackupLocalData = this._onClickToBackupLocalData.bind(this);
    this._onClickToBackupDropboxData = this._onClickToBackupDropboxData.bind(this);
    this._onClickToSyncLocalData = this._onClickToSyncLocalData.bind(this);
    this._onClickToSyncDropboxData = this._onClickToSyncDropboxData.bind(this);
    this._onClickToUpdatePlayer = this._onClickToUpdatePlayer.bind(this);
    this._onClickToResetDatabse = this._onClickToResetDatabse.bind(this);
  }

  componentDidMount() {
    // Country
    const countryData = TopRanking.getCountryList();
    let defaultCountryCode =
      PreferenceManager.getPreference('default.topRanking.countryCode');
    this._makeTopRankingOptions(countryData, defaultCountryCode);

    // Languages
    const languages = L10nManager.getSupportedLanguages();
    let defaultLanguage = PreferenceManager.getPreference('default.language');
    this._makeLanguageOptions(languages, defaultLanguage);

    // Track Format
    this._buildTrackFormatOptions();

    // Searchers
    Searcher.getSupportedSearchers().then((searchers) => {
      let defaultSearcher =
        PreferenceManager.getPreference('default.searcher');
      this._makeSearcherOptions(searchers, defaultSearcher);
    });

    // Events
    PreferenceManager.on('preference-updated', (key, newPreference) => {
      let obj = {};
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
  }

  _makeLanguageOptions (languages, defaultLanguage) {
    languages = languages || [];
    defaultLanguage = defaultLanguage || 'en';

    let select = this.refs.supportedLanguagesSelect;
    languages.forEach((language) => {
      let option = document.createElement('option');
      option.text = language.label;
      option.value = language.lang;
      option.selected = (language.lang === defaultLanguage);
      select.add(option);
    });
  }

  _makeTopRankingOptions (countryData, defaultCountryCode) {
    let select = this.refs.topRankingSelect;
    Object.keys(countryData).forEach((countryCode) => {
      let option = document.createElement('option');
      option.text = countryData[countryCode];
      option.value = countryCode;
      option.selected = (defaultCountryCode === countryCode);
      select.add(option);
    });
  }

  _makeSearcherOptions(searchers, defaultSearcher) {
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
  }

  _buildTrackFormatOptions() {
    let trackFormats = TrackInfoFetcher.getSupportedFormats();
    let defaultFormat =
      PreferenceManager.getPreference('default.track.format') || 'best';
    let select = this.refs.trackFormatSelect;

    // remove childrens first
    while (select.lastChild) {
      select.removeChild(select.lastChild);
    }

    // then build
    trackFormats.forEach((format) => {
      let option = document.createElement('option');
      option.text = _(format.l10nId);
      option.value = format.value;
      option.selected = (format.value === defaultFormat);
      select.add(option);
    });
  }

  _onChangeToSetPreference(event) {
    let target = event.target;
    let enabled = target.checked;
    let key = target.dataset.key;

    if (key) {
      PreferenceManager.setPreference(key, enabled);
    }
  }

  _onLanguageChange(event) {
    let language = event.target.value;
    L10nManager.changeLanguage(language);
  }

  _onTopRankingChange(event) {
    let countryCode = event.target.value;
    TopRanking.changeCountry(countryCode);
  }

  _onSearcherChange(event) {
    let searcherName = event.target.value;
    Searcher.changeSearcher(searcherName);
  }

  _onTrackFormatChange(event) {
    let trackFormat = event.target.value;
    TrackInfoFetcher.changeFormat(trackFormat);
  }

  _onClickToImportYoutubePlaylist() {
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
  }

  _onFormSubmit(event) {
    event.preventDefault();
  }

  _onClickToBackupLocalData() {
    AppDialog.showOpenDialog({
      title: 'Where to backup your track ?',
      properties: ['openDirectory']
    }, (folderPath) => {
      Notifier.alert('Start to backup data !');

      let playlists = PlaylistManager.export();
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
  }

  _onClickToBackupDropboxData() {
    let playlists = PlaylistManager.export();
    Notifier.alert('Start to backup data !');

    DropboxBackuper.backup(playlists, {
      folderPath: '/playlists'
    }).then(() => {
      Notifier.alert('backup data successfully :)');
    }).catch((error) => {
      Notifier.alert('Something went wrong, please try again');
      console.log(error);
    });
  }

  _onClickToSyncLocalData() {
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
  }

  _onClickToSyncDropboxData() {
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
  }

  _onClickToUpdatePlayer() {
    Notifier.alert('Start to update, please don\'t play music when updating');

    AutoUpdater.updateYoutubeDl().then(() => {
      Notifier.alert('Success ! You are good to go now :)');
    }).catch((error) => {
      Notifier.alert('Something went wrong when updating');
      console.log(error);
    });
  }

  _onClickToResetDatabse() {
    Dialog.confirm(
      _('settings_option_reset_database_confirm'),
      (sure) => {
        if (sure) {
          DB.resetDatabase().then(() => {
            Remote.getCurrentWindow().reload();
          });
        }
    });
  }

  render() {
    let isDesktopNotificationEnabled =
      PreferenceManager.getPreference('desktop.notification.enabled');

    let isAlwaysOnTopEnabled =
      PreferenceManager.getPreference('default.alwaysOnTop.enabled');

    let isChatroomEnabled =
      PreferenceManager.getPreference('default.chatroom.enabled');

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
                <L10nSpan l10nId="settings_option_chatroom_enabled"/>
              </label>
              <div className="col-sm-3">
                <div className="checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isChatroomEnabled}
                      data-key="default.chatroom.enabled"
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
}

module.exports = SettingsComponent;
