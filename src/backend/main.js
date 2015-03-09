// By doing so, we won't mess up with `require` keyword
window.requireNode = window.require;
window.require = undefined;

var gui = requireNode('nw.gui');
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
