define(function(require) {

  var React = require('react');
  var ToolbarCloseButton = React.createClass({
    render: function() {
      return (
        <button className="toolbar-close-button">
        </button>
      );
    }
  });

  return ToolbarCloseButton;
});
