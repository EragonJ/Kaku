import React from 'react';
import ReactEmoji from 'react-emoji';

class Comment extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let data = this.props.data;

    // TODO
    // drop ReactEmoji since we do have emoji-mart now.
    // need to figure out the way to parse strings to <span>
    let emojifiedComment = ReactEmoji.emojify(data.comment);

    /* jshint ignore:start */
    return (
      <div className="comment">
        <span className="comment-author">{data.userName}</span>
        <div className="comment-text">
         {emojifiedComment}
        </div>
      </div>
    );
    /* jshint ignore:end */
  }
}

Comment.propTypes = {
  data: React.PropTypes.object.isRequired
};

Comment.defaultProps = {
  data: {}
};

export default Comment;
