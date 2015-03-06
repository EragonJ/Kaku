var gui = require('nw.gui');
var win = gui.Window.get();

window.addEventListener('shrink-window', function() {
  win.minimize();
});

window.addEventListener('enlarge-window', function() {
  win.maximize();
});

window.addEventListener('close-window', function() {
  win.close();
});

window.addEventListener('show-devtools', function() {
  win.showDevTools(); 
});
