define(function(require) {

  var React = require('react');
  var TopRankingTrack = React.createClass({
    handleClick: function(event) {
      // TODO
    },
    render: function() {
      return (
        <div className="topranking-track">
          <img src={this.props.data.cover_url_large}/>
        </div>
      );
    }
  });

  return TopRankingTrack;
});
