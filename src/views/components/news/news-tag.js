import React, { Component, PropTypes } from 'react';
import ClassNames from 'classnames';

class NewsTag extends Component {
  render() {
    let data = this.props.data;
    let title = data.date + ' - ' + data.title;
    let content = data.content;
    let label = 'panel-' + data.label || 'panel-default';

    let classObject = {};
    classObject.panel = true;
    classObject[label] = true;
    let className = ClassNames(classObject);

    /* jshint ignore:start */
    return (
      <div className={className}>
        <div className="panel-heading">{title}</div>
        <div
          className="panel-body"
          dangerouslySetInnerHTML={{
            __html: content
          }}
        />
      </div>
    );
    /* jshint ignore:end */
  }
}

NewsTag.propTypes = {
  data: PropTypes.object.isRequired
};
NewsTag.defaultProps = {
  date: '',
  title: '',
  content: ''
};

exports default NewsTag;
