import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

class NewsTag extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let data = this.props.data;
    let title = `${data.date} - ${data.title}`;
    let content = data.content;
    let label = `panel-${data.label}` || 'panel-default';

    let classObject = {};
    classObject.panel = true;
    classObject[label] = true;
    const className = ClassNames(classObject);

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

module.exports = NewsTag;
