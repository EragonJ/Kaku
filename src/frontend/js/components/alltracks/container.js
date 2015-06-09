define(function(require) {
  'use strict';

  var Searcher = require('backend/Searcher');
  var React = require('react');

  var L10nSpan = require('components/shared/l10n-span');
  var PlayAllButton = require('components/shared/playall-button');
  var NoTrack = require('components/shared/no-track');
  var Track = require('components/shared/track');

  var AllTracksContainer = React.createClass({
    getInitialState: function() {
      return {
        tracks: []
      };
    },

    componentDidMount: function() {
      Searcher.on('search-results-updated', (results) => {
        this.setState({
          tracks: results
        });
      });
    },

    render: function() {
      /* jshint ignore:start */
      var tracks = this.state.tracks;
      var noTracksDiv;

      if (tracks.length === 0) {
        noTracksDiv = <NoTrack/>;
      }

      return (
        <div className="alltracks-slot">
          <div className="header clearfix">
            <h1>
              <i className="fa fa-fw fa-search"></i>
              <L10nSpan l10nId="search_header"/>
            </h1>
            <div className="control-buttons">
              <PlayAllButton data={tracks}/>
            </div>
          </div>
          <div className="alltracks-container">
            {noTracksDiv}
            {tracks.map(function(track) {
              return <Track data={track}/>;
            })}
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return AllTracksContainer;
});
