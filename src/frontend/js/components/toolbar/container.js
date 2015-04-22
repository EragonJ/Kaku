define(function(require) {
  'use strict';

  var gui = requireNode('nw.gui');
  var React = require('react');
  var SearchbarContainer = require('components/searchbar/container');

  var ToolbarContainer = React.createClass({
    _handleShrinkButtonClick: function() {
      var evt = new CustomEvent('shrink-window');
      window.dispatchEvent(evt);
    },

    _handleEnlargeButtonClick: function() {
      var evt = new CustomEvent('enlarge-window');
      window.dispatchEvent(evt);
    },

    _handleDevtoolsButtonClick: function() {
      var evt = new CustomEvent('show-devtools');
      window.dispatchEvent(evt);
    },

    _handleCloseButtonClick: function() {
      var evt = new CustomEvent('close-window');
      window.dispatchEvent(evt);
    },

    _registerHotkeys: function() {
      var option = {
        key: 'Ctrl+Alt+i',
        active: () => {
          this._handleDevtoolsButtonClick();
        }
      };
      var shortcut = new gui.Shortcut(option);
      gui.App.registerGlobalHotKey(shortcut);
    },

    componentDidMount: function() {
      this._registerHotkeys();
    },

    render: function() {
      /* jshint ignore:start */
      return (
        <div className="toolbar-container clearfix">
          <div className="toolbar-buttons">
            <button
              className="toolbar-close-button"
              onClick={this._handleCloseButtonClick}>
                <i className="fa fa-fw fa-times"></i>
            </button>
            <button
              className="toolbar-shrink-button"
              onClick={this._handleShrinkButtonClick}>
                <i className="fa fa-fw fa-minus"></i>
            </button>
            <button
              className="toolbar-enlarge-button"
              onClick={this._handleEnlargeButtonClick}>
                <i className="fa fa-fw fa-plus"></i>
            </button>
            <button
              className="toolbar-devtools-button"
              onClick={this._handleDevtoolsButtonClick}>
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
