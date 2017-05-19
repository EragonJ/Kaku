import React, { Component } from 'react';
import PropTypes from 'prop-types';
import L10nManager from '../../../modules/L10nManager';

const _ = L10nManager.get.bind(L10nManager);

class L10nSpan extends Component {
  constructor(props) {
    super(props);

    this.state = {
      translation: ''
    };

    this._updateL10nTranslation = this._updateL10nTranslation.bind(this);
  }

  componentDidMount() {
    this._updateL10nTranslation();

    L10nManager.on('language-initialized', () => {
      this._updateL10nTranslation();
    });

    L10nManager.on('language-changed', () => {
      this._updateL10nTranslation();
    });
  }

  componentWillReceiveProps(nextProps) {
    // NOTE
    // we need to add this to make manually changing l10nId work.
    this._updateL10nTranslation(nextProps);
  }

  _updateL10nTranslation(nextProps) {
    let props = nextProps || this.props;
    let translation = _(props.l10nId, props.l10nParams);
    this.setState({
      translation: translation
    });
  }

  render() {
    /* jshint ignore:start */
    let translation = this.state.translation;
    let where = this.props.where || 'default';
    let children = null;
    let props = {};

    // clone props at first
    for (let key in this.props) {
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

    // [Note] - can be refactored later
    //
    // React.js will check unknown props for us, it's a quick hack to remove
    // them because of the effort to change the interface.

    props['data-l10nId'] = props.l10nId;
    props['data-l10nParams'] = props.l10nParams;
    props['data-where'] = props.where;

    delete props.l10nId;
    delete props.l10nParams;
    delete props.where;

    return React.createElement('span', props, children);
    /* jshint ignore:end */
  }
}

L10nSpan.propTypes = {
  l10nId: PropTypes.string.isRequired,
  l10nParams: PropTypes.object,
  where: PropTypes.string
};

L10nSpan.defaultProps = {
  l10nId: '',
  l10nParams: {}
};

module.exports = L10nSpan;
