import React from 'react';
import ClassNames from 'classnames';
import L10nSpan from './l10n-span';

class ActionButton extends React.Component {
  constructor(props) {
    super(props);
  } 

  render() {
    /* jshint ignore:start */
    let buttonSpan;

    if (this.props.l10nId) {
      buttonSpan = <L10nSpan l10nId={this.props.l10nId}/>;
    }
    else {
      buttonSpan = <span>{this.props.wording}</span>;
    }

    return (
      <button
        className={this.props.buttonClass}
        onClick={this.props.onClick}
        disabled={this.props.isDisabled}>
          <i className={this.props.iconClass}></i>
          {buttonSpan}
      </button>
    );
    /* jshint ignore:end */
  }
}

ActionButton.propTypes = {
  wording: React.PropTypes.string,
  l10nId: React.PropTypes.string,
  buttonClass: React.PropTypes.string,
  iconClass: React.PropTypes.string,
  isDisabled: React.PropTypes.bool,
  onClick: React.PropTypes.func
};

ActionButton.defaultProps = {
  wording: '',
  l10nId: '',
  buttonClass: '',
  iconClass: '',
  isDisabled: false,
  onClick: function() {}
};

export default ActionButton;
