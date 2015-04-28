define(function(require) {
  'use strict';

  var fdialogs = requireNode('node-webkit-fdialogs');
  var request = requireNode('request');
  var crypto = requireNode('crypto');
  var gui = requireNode('nw.gui');
  var fs = requireNode('fs');
  var CoreData = require('backend/CoreData');
  var Notifier = require('modules/Notifier');
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
      Player.ready().then((player) => {
        player.on('play', this._onPlayerPlay);
        player.on('pause', this._onPlayerPause);
        this.setState({
          player: player
        });
      });
    },

    _onBackwardButtonClick: function() {
      Player.playNextTrack();
    },

    _onForwardButtonClick: function() {
      Player.playPreviousTrack();
    },

    _onResumeButtonClick: function() {
      Player.ready().then((player) => {
        if (this.state.player.paused()) {
          this.state.player.play();
        }
        else {
          this.state.player.pause();
        }
      });
    },

    _onDownloadButtonClick: function() {
      Player.ready().then(function(player) {
        var src = player.src();
        var fakeFile = new Buffer('', 'utf-8');
        // TODO
        // we can make a better naming in the future
        var filename =
          'music-' + crypto.randomBytes(3).toString('hex') + '.mp4';

        fdialogs.saveFile(fakeFile, filename, function (error, path) {
          if (error) {
            console.log('error when saving file to - ', path);
            console.log('file src - ', src);
          }
          else {
            Notifier.alert('Start to download your track !');

            // we got the path from fakeFile, so it's time to save
            // the real streaming file to override it !
            //
            // I know this idea is smart :)
            var downloadRequest = request.get(src).pipe(
              fs.createWriteStream(path));

            downloadRequest
              .on('error', () => {
                Notifier.alert('Sorry, something went wrong, please try again');
                console.log('error when saving file from stream');
              })
              .on('finish', () => {
                Notifier.alert('Download finished ! Go check your track :)');
              });
          }
        });
      });
    },

    _onExternalButtonClick: function() {
      var track = Player.playingTrack;
      if (track) {
        gui.Shell.openExternal(track.platformTrackUrl);
      }
    },

    _onLyricButtonClick: function() {

    },

    _onRepeatButtonClick: function() {
      Player.ready().then((player) => {
        // TODO
        // change to different icon here
        var repeatIconDOM = this.refs.repeatIcon.getDOMNode();
        repeatIconDOM.classList.toggle('fa-repeat');
        repeatIconDOM.classList.toggle('fa-times');

        var isRepeating = this.state.isRepeating;
        player.loop(!isRepeating);
      });
    },

    render: function() {
      /* jshint ignore:start */
      return (
        <div className="control-buttons">
          <button className="backward-button" onClick={this._onBackwardButtonClick}>
            <i className="fa fa-fw fa-step-backward"></i>
          </button>
          <button className="resume-button" onClick={this._onResumeButtonClick}>
            <i className="fa fa-fw fa-play" ref="resumeIcon"></i>
          </button>
          <button className="forward-button" onClick={this._onForwardButtonClick}>
            <i className="fa fa-fw fa-step-forward"></i>
          </button>
          <button className="repeat-button" onClick={this._onRepeatButtonClick}>
            <i className="fa fa-fw fa-repeat" ref="repeatIcon"></i>
          </button>
          <button className="download-button" onClick={this._onDownloadButtonClick}>
            <i className="fa fa-fw fa-cloud-download"></i>
          </button>
          <button className="external-button" onClick={this._onExternalButtonClick}>
            <i className="fa fa-fw fa-external-link"></i>
          </button>
          <button className="lyric-button" onClick={this._onLyricButtonClick} disabled>
            <i className="fa fa-fw fa-font"></i>
          </button>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return PlayerControlButtons;
});