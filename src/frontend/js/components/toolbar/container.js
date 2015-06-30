define(function(require) {
  'use strict';

  var remote = requireNode('remote');
  var App = remote.require('app');
  var React = require('react');
  var SearchbarContainer = require('components/searchbar/container');

  var ToolbarContainer = React.createClass({
    _onCloseButtonClick: function() {
      App.quit();
    },
    _onShrinkButtonClick: function() {
      remote.getCurrentWindow().minimize();
    },
    _onEnlargeButtonClick: function() {
      var win = remote.getCurrentWindow();
      if (win.isMaximized()) {
        win.unmaximize();
      }
      else {
        win.maximize();
      }
    },
    render: function() {
      /* jshint ignore:start */
      return (
        <div className="toolbar-container clearfix">
          <div className="toolbar-buttons">
            <span
              className="button close-button"
              onClick={this._onCloseButtonClick}>
                <i className="fa fa-times"></i>
            </span>
            <span
              className="button shrink-button"
              onClick={this._onShrinkButtonClick}>
                <i className="fa fa-minus"></i>
            </span>
            <span
              className="button enlarge-button"
              onClick={this._onEnlargeButtonClick}>
                <i className="fa fa-plus"></i>
            </span>
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
