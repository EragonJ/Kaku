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
      var self = this;
      var playerDOM = document.createElement('video');
      playerDOM.id = 'player';
      this.refs.playerContainer.getDOMNode().appendChild(playerDOM);

      Player.setPlayer(playerDOM);
      Player.ready().then(function(player) {
        player.on('play', self._onPlayerPlay);
        player.on('pause', self._onPlayerPause);
        player.on('progress', self._onPlayerProgress);
        self.setState({
          player: player
        });
      });
    },

    _watchCurrentTrackChange: function() {
      var self = this;
      CoreData.watch('currentTrack', function(_1, _2, trackInfo) {
        var trackUrl = trackInfo.platformTrackUrl;
        TrackInfoFetcher.getInfo(trackUrl).then(function(fetchedInfo) {
          var trackRealUrl = fetchedInfo.url;
          trackInfo.platformTrackRealUrl = trackRealUrl;

          self.state.player.src(trackRealUrl);
          self.state.player.play();

          // save this track to playedTracks
          var playedTracks = CoreData.get('playedTracks');
          playedTracks.push(trackInfo);
          CoreData.set('playedTracks', playedTracks);
        });
      });
    },

    render: function() {
      return (
        <div className="playerContainer vjs-default-skin" ref="playerContainer"></div>
      );
    }
  });

  return PlayerTrack;
});
