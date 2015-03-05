// XXX
// we have to use requirejs as entry point
requirejs([
  'react',
  'components/toolbar/container'
], function(React, ToolbarContainer) {

  // slots list
  var toolbarSlot = document.querySelector('.toolbar-slot');

  // render list
  React.render(ToolbarContainer, toolbarSlot);
});
