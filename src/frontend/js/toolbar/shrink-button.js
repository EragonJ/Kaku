define(function(require) {

  var React = require('react');
  var ToolbarShrinkButton = React.createClass({
    handleClick: function() {
      var evt = new CustomEvent('shrink-window');
      window.dispatchEvent(evt);
    },
    render: function() {
      return (
        <button className="toolbar-shrink-button" onClick={this.handleClick}>
          <i className="fa fa-minus"></i>
        </button>
      );
    }
  });

  return ToolbarShrinkButton;
});
