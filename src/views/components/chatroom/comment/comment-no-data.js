import React from 'react';
import L10nSpan from '../../shared/l10n-span';

class CommentNoData extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="comment">
        <div className="comment-no-data">
          <L10nSpan l10nId="chatroom_comment_no_data"/>
        </div>
      </div>
    );
  }
}

export default CommentNoData;
