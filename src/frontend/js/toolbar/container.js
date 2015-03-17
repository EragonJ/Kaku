define(function(require) {

  var React = require('react');
  var ToolbarSongInformation = require('toolbar/song-information');
  var ToolbarShrinkButton = require('toolbar/shrink-button');
  var ToolbarEnlargeButton = require('toolbar/enlarge-button');
  var ToolbarCloseButton = require('toolbar/close-button');
  var ToolbarDevtoolsButton = require('toolbar/devtools-button');

  var ToolbarContainer = React.createClass({
    render: function() {
      return (
        <div className="toolbar-container">
          <div className="toolbar-buttons">
            <ToolbarCloseButton/>
            <ToolbarShrinkButton/>
            <ToolbarEnlargeButton/>
            <ToolbarDevtoolsButton/>
          </div>
          <ToolbarSongInformation/>
        </div>
      );
    }
  });

  return <ToolbarContainer/>;
});
