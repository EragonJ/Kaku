define(function(require) {
  'use strict';

  var React = require('react');
  var SearchbarContainer = require('components/searchbar/container');

  var ToolbarContainer = React.createClass({
    render: function() {
      /* jshint ignore:start */
      return (
        <div className="toolbar-container clearfix">
          <div className="toolbar-buttons"></div>
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
