define(function(require) {
  'use strict';

  var React = require('react');
  var Player = require('modules/Player');

  var L10nSpan = require('components/shared/l10n-span');

  var PlayAllButton = React.createClass({
    propTypes: {
      data: React.PropTypes.array.isRequired
    },

    _clickToPlayAll: function() {
      Player.playAll(this.props.data);
    },

    render: function() {
      /* jshint ignore:start */
      var isDiabled = (this.props.data.length === 0);
      return (
        <button
          className="playall-button"
          onClick={this._clickToPlayAll}
          disabled={isDiabled}>
            <i className="fa fa-fw fa-play-circle"></i>
            <L10nSpan l10nId="component_play_all"/>
        </button>
      );
      /* jshint ignore:end */
    }
  });

  return PlayAllButton;
});
