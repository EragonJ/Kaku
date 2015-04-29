define(function(require) {
  'use strict';

  var React = require('react');

  var SettingsContainer = React.createClass({
    render: function() {
      /* jshint ignore:start */
      return (
        <div className="settings-slot">
          <div className="header clearfix">
            <h1><i className="fa fa-fw fa-cog"></i>Settings</h1>
          </div>
          <div className="settings-container">
            Nothing
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
  });

  return SettingsContainer;
});
