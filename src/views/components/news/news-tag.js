import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

class NewsTag extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const data = this.props.data;
    const title = `${data.date} - ${data.title}`;
    const content = data.content;
    const label = `panel-${data.label}` || 'panel-default';

    let classObject = {};
    classObject.panel = true;
    classObject[label] = true;
    const className = ClassNames(classObject);

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

module.exports = NewsTag;
