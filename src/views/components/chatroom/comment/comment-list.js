import React from 'react';
import Comment from './comment';
import CommentNoData  from './comment-no-data';

class CommentList extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    let commentListNode = this.refs.commentList;
    let scrollHeight = commentListNode.scrollHeight;
    $(commentListNode).scrollTop(scrollHeight);
  }

  render() {
    let renderedElement;
    let commentNodes = this.props.comments.map((comment, index) => {
      return <Comment key={index} data={comment}></Comment>;
    });

    if (commentNodes.length !== 0) {
      renderedElement = commentNodes;
    }
    else {
      renderedElement = <CommentNoData></CommentNoData>;
    }

    return (
      <div className="comment-list" ref="commentList">{renderedElement}</div>
    );
  }
}

CommentList.propTypes = {
  comments: React.PropTypes.array.isRequired
};

CommentList.defaultProps = {
  comments: []
};

export default CommentList;
