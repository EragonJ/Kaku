import React, { Component } from 'react';
import Electron from 'electron';
import SearchbarComponent from '../searchbar';
import DownloadManager from '../../../modules/DownloadManager';
import AppCore from '../../../modules/AppCore';

const Remote = Electron.remote;
const App = Remote.app;

class ToolbarComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      downloadPercent: 0,
      title: ''
    };

    this._onCloseButtonClick = this._onCloseButtonClick.bind(this);
    this._onShrinkButtonClick = this._onShrinkButtonClick.bind(this);
    this._onEnlargeButtonClick = this._onEnlargeButtonClick.bind(this);
    this._processDownloadProgress = this._processDownloadProgress.bind(this);
  }

  componentDidMount() {
    this.setState({
      title: AppCore.title
    });

    AppCore.on('titleUpdated', (title) => {
      this.setState({
        title: title
      });
    });

    DownloadManager.on('download-progress', (percent) => {
      this._processDownloadProgress(percent);
    });

    DownloadManager.on('download-finish', () => {
      this._processDownloadProgress(0);
    });

    DownloadManager.on('download-error', () => {
      this._processDownloadProgress(0);
    });
  }

  _onCloseButtonClick() {
    App.quit();
  }

  _onShrinkButtonClick() {
    Remote.getCurrentWindow().minimize();
  }

  _onEnlargeButtonClick() {
    let win = Remote.getCurrentWindow();
    if (win.isMaximized()) {
      win.unmaximize();
    }
    else {
      win.maximize();
    }
  }

  _processDownloadProgress(percent) {
    this.setState({
      downloadPercent: percent
    });
  }

  render() {
    let title = this.state.title;
    let downloadPercent = this.state.downloadPercent;
    let progressStyle = {
      width: `${downloadPercent}%`
    };

    return (
      <div className="toolbar-component clearfix">
        <div className="toolbar-buttons">
          <span
            className="button close-button"
            onClick={this._onCloseButtonClick}>
              <i className="fa fa-times"></i>
          </span>
          <span
            className="button shrink-button"
            onClick={this._onShrinkButtonClick}>
              <i className="fa fa-minus"></i>
          </span>
          <span
            className="button enlarge-button"
            onClick={this._onEnlargeButtonClick}>
              <i className="fa fa-plus"></i>
          </span>
        </div>
        <div className="toolbar-song-information">
          {title}
        </div>
        <div className="searchbar-slot">
          <SearchbarComponent/>
        </div>
        <div className="toolbar-progressbar" style={progressStyle}></div>
      </div>
    );
  }
}

module.exports = ToolbarComponent;
