import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import L10nSpan from './l10n-span';

class ActionButton extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let buttonSpan;

    if (this.props.l10nId) {
      buttonSpan = <L10nSpan l10nId={this.props.l10nId}/>;
    }
    else {
      buttonSpan = <span>{this.props.wording}</span>;
    }

    return (
      <button
        type={this.props.type}
        className={this.props.buttonClass}
        onClick={this.props.onClick}
        disabled={this.props.isDisabled}>
          <i className={this.props.iconClass}></i>
          {buttonSpan}
      </button>
    );
  }
}

ActionButton.propTypes = {
  type: PropTypes.string,
  wording: PropTypes.string,
  l10nId: PropTypes.string,
  buttonClass: PropTypes.string,
  iconClass: PropTypes.string,
  isDisabled: PropTypes.bool,
  onClick: PropTypes.func
};

ActionButton.defaultProps = {
  type: 'button',
  wording: '',
  l10nId: '',
  buttonClass: '',
  iconClass: '',
  isDisabled: false,
  onClick: function() {}
};

export default ActionButton;
