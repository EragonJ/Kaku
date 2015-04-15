define(function(require) {
  'use strict';

  var CoreData = require('backend/CoreData');
  var React = require('react');

  var Track = React.createClass({
    handleClick: function(event) {
      CoreData.set('currentTrack', this.props.data);
    },
    render: function() {
      var data = this.props.data;

      /* jshint ignore:start */
      return (
        <div className="track" onClick={this.handleClick}>
          <img src={data.covers.medium} title={data.title}/>
          <div className="info">
            <div className="track-name">{data.title}</div>
            <div className="track-artist">{data.artist}</div>
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return Track;
});
