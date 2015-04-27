define(function(require) {
  'use strict';

  var React = require('react');
  var Player = require('modules/Player');

  var PlayAllButton = React.createClass({
    propTypes: {
      data: React.PropTypes.array.isRequired
    },

    _clickToPlayAll: function() {
      Player.playAll(this.props.data);
    },

    render: function() {
      /* jshint ignore:start */
      return (
        <button className="playall-button" onClick={this._clickToPlayAll}>
          <i className="fa fa-fw fa-play-circle"></i>
          Play All
        </button>
      );
      /* jshint ignore:end */
    }
  });

  return PlayAllButton;
});
