define(function(require) {

  var React = require('react');
  var ToolbarSongInformation = require('components/toolbar/song-information');
  var ToolbarShrinkButton = require('components/toolbar/shrink-button');
  var ToolbarEnlargeButton = require('components/toolbar/enlarge-button');
  var ToolbarCloseButton = require('components/toolbar/close-button');
  var ToolbarDevtoolsButton = require('components/toolbar/devtools-button');

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
