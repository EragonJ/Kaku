define(function(require) {
  'use strict';

  var React = require('react');
  var PlayerTrack = React.createClass({
    getDefaultProps: function() {
      return {
        imageUrl: ''
      };
    },
    render: function() {
      return (
        <video className="track"></video>
      );
    }
  });

  return PlayerTrack;
});
