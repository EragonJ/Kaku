define(function(require) {
  'use strict';

  var request = requireNode('request');
  var fs = requireNode('fs');
  var fdialogs = requireNode('node-webkit-fdialogs');
  var CoreData = require('backend/CoreData');
  var Player = require('modules/Player');
  var React = require('react');

  var PlayerControlButtons = React.createClass({
    getInitialState: function() {
      return {
        player: null,
        isRepeating: false
      };
    },

    componentDidMount: function() {
      this._setupPlayer();
    },

    _onPlayerPlay: function() {
      this._togglePlayIcon();
    },

    _onPlayerPause: function() {
      this._togglePlayIcon();
    },

    _togglePlayIcon: function() {
      var resumeIconDOM = this.refs.resumeIcon.getDOMNode();
      resumeIconDOM.classList.toggle('fa-play');
      resumeIconDOM.classList.toggle('fa-pause');
    },

    _setupPlayer: function() {
      var self = this;
      Player.ready().then(function(player) {
        player.on('play', self._onPlayerPlay);
        player.on('pause', self._onPlayerPause);
        self.setState({
          player: player
        });
      });
    },

    _onBackwardButtonClick: function() {

    },

    _onResumeButtonClick: function() {
      var self = this;
      Player.ready().then(function(player) {
        if (self.state.player.paused()) {
          self.state.player.play();
        }
        else {
          self.state.player.pause();
        }
      });
    },

    _onForwardButtonClick: function() {

    },

    _onDownloadButtonClick: function() {
      Player.ready().then(function(player) {
        var src = player.src();
        var fakeFile = new Buffer('', 'utf-8');
        fdialogs.saveFile(fakeFile, function (error, path) {
          if (error) {
            console.log('error when saving file to - ', path);
            console.log('file src - ', src);
          }
          else {
            // we got the path from fakeFile, so it's time to save
            // the real streaming file to override it !
            //
            // I know this idea is smart :)
            request
              .get(src)
              .on('error', function() {
                console.log('error when saving file from stream');
              })
              .pipe(fs.createWriteStream(path));
          }
        });
      });
    },

    _onInfoButtonClick: function() {

    },

    _onLyricButtonClick: function() {

    },

    _onRepeatButtonClick: function() {
      var self = this;
      Player.ready().then(function(player) {
        // TODO
        // change to different icon here
        var repeatIconDOM = self.refs.repeatIcon.getDOMNode();
        repeatIconDOM.classList.toggle('fa-repeat');
        repeatIconDOM.classList.toggle('fa-times');

        var isRepeating = self.state.isRepeating;
        player.loop(!isRepeating);
      });
    },

    render: function() {
      return (
        <div className="control-buttons">
          <button className="backward-button" onClick={this._onBackwardButtonClick} disabled>
            <i className="fa fa-fw fa-step-backward"></i>
          </button>
          <button className="resume-button" onClick={this._onResumeButtonClick}>
            <i className="fa fa-fw fa-play" ref="resumeIcon"></i>
          </button>
          <button className="forward-button" onClick={this._onForwardButtonClick} disabled>
            <i className="fa fa-fw fa-step-forward"></i>
          </button>
          <button className="repeat-button" onClick={this._onRepeatButtonClick}>
            <i className="fa fa-fw fa-repeat" ref="repeatIcon"></i>
          </button>
          <button className="download-button" onClick={this._onDownloadButtonClick}>
            <i className="fa fa-fw fa-cloud-download"></i>
          </button>
          <button className="info-button" onClick={this._onInfoButtonClick} disabled>
            <i className="fa fa-fw fa-info"></i>
          </button>
          <button className="lyric-button" onClick={this._onLyricButtonClick} disabled>
            <i className="fa fa-fw fa-font"></i>
          </button>
        </div>
      );
    }
  });

  return PlayerControlButtons;
});
