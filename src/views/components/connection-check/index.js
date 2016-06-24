var React = require('react');
var ClassNames = require('classnames');
var L10nSpan = require('../shared/l10n-span');

var ConnectionCheckComponent = React.createClass({
  getInitialState: function() {
    return {
      isOnline: navigator.onLine
    };
  },

  componentDidMount: function() {
    window.addEventListener('online', this._checkConnection);
    window.addEventListener('offline', this._checkConnection);
  },

  _checkConnection: function() {
    this.setState({
      isOnline: navigator.onLine
    });
  },

  render: function() {
    var className = ClassNames({
      'connection-check-component': true,
      'global-overlay': true,
      'is-online': this.state.isOnline
    });

    /* jshint ignore:start */
    return (
      <div className={className}>
        <h1>
          <i className="fa fa-exclamation-triangle"></i>
          <L10nSpan l10nId="component_connection_lost"/>
        </h1>
      </div>
    );
    /* jshint ignore:end */
  }
});

module.exports = ConnectionCheckComponent;
