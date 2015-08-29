var React = require('react');
var L10nManager = require('../../../modules/L10nManager');

var L10nSpan = React.createClass({
  propTypes: {
    l10nId: React.PropTypes.string.isRequired,
    l10nParams: React.PropTypes.object,
    where: React.PropTypes.string
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

  componentWillReceiveProps: function(nextProps) {
    // NOTE
    // we need to add this to make manually changing l10nId work.
    this._updateL10nTranslation(nextProps);
  },

  _updateL10nTranslation: function(nextProps) {
    var props = nextProps || this.props;
    var translation = L10nManager.get(props.l10nId, props.l10nParams);
    this.setState({
      translation: translation
    });
  },

  render: function() {
    /* jshint ignore:start */
    var translation = this.state.translation;
    var where = this.props.where || 'default';
    var children = null;
    var props = {};

    // clone props at first
    for (var key in this.props) {
      props[key] = this.props[key];
    }

    if (this.props.children) {
      children = this.props.children;
    }

    if (where === 'default') {
      if (!children) {
        children = translation;
      }
      else {
        console.error('Can\'t assign l10nId in l10nSpan with children inside');
        console.error('We will directly ignore the translation here');
      }
    }
    else {
      // TODO
      // dangerous, we should add more protect
      props[where] = translation;
    }

    return React.createElement('span', props, children);
    /* jshint ignore:end */
  }
});

module.exports = L10nSpan;
