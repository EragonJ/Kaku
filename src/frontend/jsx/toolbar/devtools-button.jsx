define(function(require) {

  var React = require('react');
  var ToolbarDevtoolsButton = React.createClass({
    handleClick: function() {
      var evt = new CustomEvent('show-devtools');
      window.dispatchEvent(evt);
    },
    render: function() {
      return (
        <button className="toolbar-devtools-button" onClick={this.handleClick}>
          <i className="fa fa-cog"></i>
        </button>
      );
    }
  });

  return ToolbarDevtoolsButton;
});
