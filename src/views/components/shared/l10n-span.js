var React = require('react');
var L10nManager = require('../../../modules/L10nManager');

var L10nSpan = React.createClass({
  propTypes: {
    l10nId: React.PropTypes.string.isRequired,
    l10nParams: React.PropTypes.object
  },

  getDefaultProps: function() {
    return {
      l10nId: '',
      l10nParams: {}
    };
  },

  getInitialState: function() {
    return {
      translation: ''
    };
  },

  componentDidMount: function() {
    this._updateL10nTranslation();

    L10nManager.on('language-initialized', () => {
      this._updateL10nTranslation();    
    });

    L10nManager.on('language-changed', () => {
      this._updateL10nTranslation();
    });
  },

  _updateL10nTranslation: function() {
    L10nManager
      .get(this.props.l10nId, this.props.l10nParams)
      .then((translation) => {
        this.setState({
          translation: translation
        });
      });
  },

  render: function() {
    /* jshint ignore:start */
    var translation = this.state.translation;
    return (
      <span>{translation}</span>
    );
    /* jshint ignore:end */
  }
});

module.exports = L10nSpan;
