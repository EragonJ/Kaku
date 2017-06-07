import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactEmoji from 'react-emoji';

class CommentComponent extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let data = this.props.data;

    // TODO
    // drop ReactEmoji since we do have emoji-mart now.
    // need to figure out the way to parse strings to <span>
    let emojifiedComment = ReactEmoji.emojify(data.comment);

    return (
      <div className="comment">
        <span className="comment-author">{data.userName}</span>
        <div className="comment-text">
         {emojifiedComment}
        </div>
      </div>
    );
  }
}

CommentComponent.propTypes = {
  data: PropTypes.object.isRequired
};

CommentComponent.defaultProps = {
  data: {}
};

export default CommentComponent;
