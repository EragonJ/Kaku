define(function(require) {
  'use strict';

  var React = require('react');
  var TopRankingTrack = React.createClass({
    handleClick: function(event) {
      // TODO
    },
    render: function() {
      var data = this.props.data;
      return (
        <div className="topranking-track">
          <img src={data.cover_url_large} title={data.title}/>
        </div>
      );
    }
  });

  return TopRankingTrack;
});
