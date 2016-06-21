import React from 'react';
import ActionButton from '../../shared/action-button';
import EmojiPicker from 'react-simple-emoji';

class CommentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { text: '', showSelector: false };
    this._handleEmoji = this._handleEmoji.bind(this);
    this._selectEmoji = this._selectEmoji.bind(this);
    this._handleInputChange = this._handleInputChange.bind(this);
  }

  _onSubmit(e) {
    e.preventDefault();
    const text = this.refs.text.value.trim();
    this.setState({ text: '' });

    // let its parent know which comment is sent
    this.props.onSubmit(text);
  }

  _selectEmoji() {
    this.setState({ showSelector: !this.state.showSelector });
  }

  _handleInputChange(e) {
    const text = e.target.value;
    this.setState({ text });
  }

  _handleEmoji(emojiText) {
    const inpuText = this.state.text;
    this.setState({
      text: `${inpuText}:${emojiText}:`,
      showSelector: !this.state.showSelector,
    });
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
          <input
            className="form-control"
            type="text"
            ref="text"
            value={this.state.text}
            onChange={this._handleInputChange}
          />
        </div>
        <ActionButton
          buttonClass="btn btn-primary"
          type="submit"
          l10nId="chartoom_comment_form_submit"
          isDisabled={!isRoomConnected}
        />
        <EmojiPicker
          show={this.state.showSelector}
          selector={this._selectEmoji}
          handleEmoji={this._handleEmoji}
        />
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
