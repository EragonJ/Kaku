define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var TrackInfoFetcher = require('backend/TrackInfoFetcher');
  var videojs = require('videojs');
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

    _setupPlayer: function() {
      var player = document.createElement('video');
      player.id = 'player';
      this.refs.playerContainer.getDOMNode().appendChild(player);

      // fallback mechanism
      videojs.options.flash.swf = 'dist/vendor/video.js/dist/video-js.swf';
      videojs(player, {});

      this.setState({
        player: player
      })
    },

    _watchCurrentTrackChange: function() {
      var self = this;
      CoreData.watch('currentTrack', function(_1, _2, trackInfo) {
        // TODO
        // we should put all information into cache later
        // to prevent us keep fetching stuffs from server

        var trackUrl = trackInfo.platformTrackUrl;
        TrackInfoFetcher.getInfo(trackUrl).then(function(fetchedInfo) {
          var trackRealUrl = fetchedInfo.url;

          self.state.player.src = trackRealUrl;
          self.state.player.play();
        });
      });
    },
    render: function() {
      return (
        <div className="playerContainer" ref="playerContainer"></div>
      );
    }
  });

  return PlayerTrack;
});
