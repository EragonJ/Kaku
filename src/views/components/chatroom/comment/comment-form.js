import React from 'react';
import ActionButton from '../../shared/action-button';

class CommentForm extends React.Component {
  constructor(props) {
    super(props);
  }

  _onSubmit(e) {
    e.preventDefault();
    var text = this.refs.text.value.trim();
    this.refs.text.value = '';

    // let its parent know which comment is sent
    this.props.onSubmit(text);
  }

  componentDidUpdate() {
    let isShown = this.props.shown;

    if (isShown) {
      this.refs.text.focus();
    }
    else {
      this.refs.text.blur();
    }
  }

  render() {
    let onSubmit = this._onSubmit.bind(this);
    let isRoomConnected = this.props.connected;

    /* jshint ignore:start */
    return (
      <form className="comment-form form-inline" onSubmit={onSubmit}>
        <div className="form-group">
          <input className="form-control" type="text" ref="text"/>
        </div>
        <ActionButton
          buttonClass="btn btn-primary"
          type="submit"
          l10nId="chartoom_comment_form_submit"
          isDisabled={!isRoomConnected}/>
      </form>
    );
    /* jshint ignore:end */
  }
}

CommentForm.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
  connected: React.PropTypes.bool,
  shown: React.PropTypes.bool
};

CommentForm.defaultProps = {
  onSubmit: function() { },
  connected: false,
  shown: false
};

export default CommentForm;
