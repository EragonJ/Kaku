define(function(require) {

  var React = require('react');
  var ToolbarCloseButton = React.createClass({
    handleClick: function() {
      var evt = new CustomEvent('close-window');
      window.dispatchEvent(evt);
    },
    render: function() {
      return (
        <button className="toolbar-close-button" onClick={this.handleClick}>
          <i className="fa fa-times"></i>
        </button>
      );
    }
  });

  return ToolbarCloseButton;
});
