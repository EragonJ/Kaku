var React = require('react');
var Player = require('../../modules/Player');
var L10nSpan = require('./l10n-span');

var PlayAllButton = React.createClass({
  propTypes: {
    data: React.PropTypes.array.isRequired
  },

  _clickToPlayAll: function() {
    Player.addTracks(this.props.data);
    Player.playNextTrack();
  },

  render: function() {
    /* jshint ignore:start */
    var isDiabled = (this.props.data.length === 0);

    return (
      <button
        className="playall-button btn btn-default"
        onClick={this._clickToPlayAll}
        disabled={isDiabled}>
          <i className="fa fa-fw fa-play-circle"></i>
          <L10nSpan l10nId="component_play_all"/>
      </button>
    );
    /* jshint ignore:end */
  }
});

module.exports = PlayAllButton;
