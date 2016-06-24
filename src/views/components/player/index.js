let React = require('react');
let Electron = require('electron');
let Remote = Electron.remote;
let IpcRender = Electron.ipcRenderer;
let ClassNames = require('classnames');
let PlayerTrack = require('../player/track');
let Player = require('../../modules/Player');
let PlayerControlButtons = require('../player/control-buttons');

let PlayerComponent = React.createClass({
  getInitialState: function() {
    return {
      tvMode: false
    };
  },

  _onClickToToggleTVMode: function() {
    // Note : this is not the same with fullscreen !
    this.setState({
      tvMode: !this.state.tvMode
    });
  },

  componentDidMount: function() {
    IpcRender.on('key-Escape', () => {
      if (this.state.tvMode) {
        this.setState({
          tvMode: false
        });
      }
    });

    // This is important because we use some CSS hack in TV mode and this
    // will influence the control bar in fullscreen, so we need to change
    // it back to normal mode to make sure the UI looks good !
    Player.on('fullscreenchange', () => {
      this.setState({
        tvMode: false
      });
    });
  },

  render: function() {
    let playerClass = ClassNames({
      'player': true,
      'tv-mode': this.state.tvMode
    });

    /* jshint ignore:start */
    return (
      <div className={playerClass}>
        <PlayerTrack/>
        <PlayerControlButtons onToggleTVMode={this._onClickToToggleTVMode}/>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = PlayerComponent;
