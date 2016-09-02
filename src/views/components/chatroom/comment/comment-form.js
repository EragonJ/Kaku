import React from 'react';
import ActionButton from '../../shared/action-button';
import { Picker } from 'emoji-mart';

class CommentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      isPickerShown: false
    };

    this._toggleEmojiPicker = this._toggleEmojiPicker.bind(this);
    this._selectEmoji = this._selectEmoji.bind(this);
    this._handleInputChange = this._handleInputChange.bind(this);
  }

  _onSubmit(e) {
    e.preventDefault();

    let text = this.refs.text.value.trim();
    if (text.length === 0) {
      return;
    }

    this.setState({
      text: ''
    });

    // let its parent know which comment is sent
    this.props.onSubmit(text);
  }

  _handleInputChange(e) {
    let text = e.target.value;
    this.setState({
      text: text
    });
  }

  _selectEmoji(emoji, e) {
    let inputText = this.state.text;
    let emojiText = emoji.id;
    let result = `${inputText} :${emojiText}:`;
    result = result.trim();

    this.setState({
      text: result,
      isPickerShown: false
    });
  }

  _toggleEmojiPicker() {
    let isPickerShown = this.state.isPickerShown;
    this.setState({
      isPickerShown: !isPickerShown
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
    let isPickerShown = this.state.isPickerShown;

    /* jshint ignore:start */
    return (
      <form className="comment-form form-inline" onSubmit={onSubmit}>
        <div className="form-group">
          <div className="input-group">
            <input
              className="form-control"
              type="text"
              ref="text"
              value={this.state.text}
              onChange={this._handleInputChange}
            />
            <span className="input-group-btn">
              <ActionButton
                type="button"
                iconClass="fa fa-smile-o"
                buttonClass="btn btn-default"
                onClick={this._toggleEmojiPicker}
              />
            </span>
          </div>
        </div>
        <ActionButton
          iconClass="fa fa-paper-plane-o"
          buttonClass="btn btn-default"
          type="submit"
          isDisabled={!isRoomConnected}
        />
        {isPickerShown &&
          <Picker
            onClick={this._selectEmoji}
            emojiSize={20}
            perLine={9}
            sheetURL="node_modules/emoji-mart/sheets/sheet_twitter_64.png"
          />
        }
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
