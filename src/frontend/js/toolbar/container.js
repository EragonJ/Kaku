define(function(require) {
  'use strict';

  var React = require('react');

  var ToolbarContainer = React.createClass({
    handleShrinkButtonClick: function() {
      var evt = new CustomEvent('shrink-window');
      window.dispatchEvent(evt);
    },
    handleEnlargeButtonClick: function() {
      var evt = new CustomEvent('enlarge-window');
      window.dispatchEvent(evt);
    },
    handleDevtoolsButtonClick: function() {
      var evt = new CustomEvent('show-devtools');
      window.dispatchEvent(evt);
    },
    handleCloseButtonClick: function() {
      var evt = new CustomEvent('close-window');
      window.dispatchEvent(evt);
    },
    render: function() {
      return (
        <div className="toolbar-container">
          <div className="toolbar-buttons">
            <button
              className="toolbar-close-button"
              onClick={this.handleCloseButtonClick}>
                <i className="fa fa-times"></i>
            </button>
            <button
              className="toolbar-shrink-button"
              onClick={this.handleShrinkButtonClick}>
                <i className="fa fa-minus"></i>
            </button>
            <button
              className="toolbar-enlarge-button"
              onClick={this.handleEnlargeButtonClick}>
                <i className="fa fa-plus"></i>
            </button>
            <button
              className="toolbar-devtools-button"
              onClick={this.handleDevtoolsButtonClick}>
                <i className="fa fa-cog"></i>
            </button>
          </div>
          <div className="toolbar-song-information">
          </div>
        </div>
      );
    }
  });

  return ToolbarContainer;
});
