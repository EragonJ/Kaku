define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var TrackInfoFetcher = require('backend/TrackInfoFetcher');
  var Player = require('modules/Player');
  var React = require('react');

  var PlayerTrack = React.createClass({
    getInitialState: function() {
      return {
        player: null
      };
    },

    componentDidMount: function() {
      this._setupPlayer();
      this._watchCurrentTrackChange();
    },

    _onPlayerPlay: function() {

    },

    _onPlayerPause: function() {

    },

    _onPlayerProgress: function() {
      
    },

    _setupPlayer: function() {
      var playerDOM = document.createElement('video');
      playerDOM.id = 'player';
      this.refs.playerContainer.getDOMNode().appendChild(playerDOM);

      Player.setPlayer(playerDOM);
      Player.ready().then((player) => {
        player.on('play', this._onPlayerPlay);
        player.on('pause', this._onPlayerPause);
        player.on('progress', this._onPlayerProgress);
        this.setState({
          player: player
        });
      });
    },

    _watchCurrentTrackChange: function() {
      CoreData.watch('currentTrack', (_1, _2, trackInfo) => {
        var trackUrl = trackInfo.platformTrackUrl;
        TrackInfoFetcher.getInfo(trackUrl).then((fetchedInfo) => {
          var trackRealUrl = fetchedInfo.url;
          trackInfo.platformTrackRealUrl = trackRealUrl;

          this.state.player.src(trackRealUrl);
          this.state.player.play();

          // save this track to playedTracks
          var playedTracks = CoreData.get('playedTracks');
          playedTracks.push(trackInfo);
          CoreData.set('playedTracks', playedTracks);
        });
      });
    },

    render: function() {
      /* jshint ignore:start */
      return (
        <div className="playerContainer vjs-default-skin" ref="playerContainer"></div>
      );
      /* jshint ignore:end */
    }
  });

  return PlayerTrack;
});
