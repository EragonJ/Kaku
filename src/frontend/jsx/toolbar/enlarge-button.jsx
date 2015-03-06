define(function(require) {

  var React = require('react');
  var ToolbarEnlargeButton = React.createClass({
    handleClick: function() {
      var evt = new CustomEvent('enlarge-window');
      window.dispatchEvent(evt);
    },
    render: function() {
      return (
        <button className="toolbar-enlarge-button" onClick={this.handleClick}>
          <i className="fa fa-plus"></i>
        </button>
      );
    }
  });

  return ToolbarEnlargeButton;
});
