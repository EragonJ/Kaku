define(function(require) {
  'use strict';

  var React = require('react');
  var SearchbarContainer = require('searchbar/container');

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
      /* jshint ignore:start */
      return (
        <div className="toolbar-container clearfix">
          <div className="toolbar-buttons">
            <button
              className="toolbar-close-button"
              onClick={this.handleCloseButtonClick}>
                <i className="fa fa-fw fa-times"></i>
            </button>
            <button
              className="toolbar-shrink-button"
              onClick={this.handleShrinkButtonClick}>
                <i className="fa fa-fw fa-minus"></i>
            </button>
            <button
              className="toolbar-enlarge-button"
              onClick={this.handleEnlargeButtonClick}>
                <i className="fa fa-fw fa-plus"></i>
            </button>
            <button
              className="toolbar-devtools-button"
              onClick={this.handleDevtoolsButtonClick}>
                <i className="fa fa-fw fa-cog"></i>
            </button>
          </div>
          <span className="toolbar-song-information"></span>
          <div className="searchbar-slot">
            <SearchbarContainer/>
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return ToolbarContainer;
});
