define(function(require) {
  'use strict';

  var React = require('react');
  var ClassNames = require('classnames');

  var NewsTag = React.createClass({
    propTypes: {
      data: React.PropTypes.object.isRequired
    },

    getDefaultProps: function() {
      return {
        date: '',
        title: '',
        content: ''
      };
    },

    render: function() {
      var data = this.props.data;
      var title = data.date + ' - ' + data.title;
      var content = data.content;
      var label = 'panel-' + data.label || 'panel-default';

      var classObject = {};
      classObject.panel = true;
      classObject[label] = true;
      var className = ClassNames(classObject);

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
  });

  return NewsTag;
});
