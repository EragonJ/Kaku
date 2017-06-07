import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ActionButton from '../../shared/action-button';
import { Picker } from 'emoji-mart';

class CommentFormComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      isPickerShown: false
    };

    this._onSubmit = this._onSubmit.bind(this);
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
    let isRoomConnected = this.props.connected;
    let isPickerShown = this.state.isPickerShown;

    return (
      <form className="comment-form form-inline" onSubmit={this._onSubmit}>
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
  }
}

CommentFormComponent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  connected: PropTypes.bool,
  shown: PropTypes.bool
};

CommentFormComponent.defaultProps = {
  onSubmit: function() { },
  connected: false,
  shown: false
};

export default CommentFormComponent;
