define(function(require) {
  'use strict';

  var React = require('react');
  var Track = React.createClass({
    handleClick: function(event) {
      
    },
    render: function() {
      var data = this.props.data;
      return (
        <div className="track">
          <img src={data.covers.medium} title={data.title}/>
        </div>
      );
    }
  });

  return Track;
});
