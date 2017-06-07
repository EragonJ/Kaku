import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Comment from './comment';
import CommentNoData  from './comment-no-data';

class CommentListComponent extends Component {
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

CommentListComponent.propTypes = {
  comments: PropTypes.array.isRequired
};

CommentListComponent.defaultProps = {
  comments: []
};

export default CommentListComponent;
