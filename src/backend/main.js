// By doing so, we won't mess up with `require` keyword
window.requireNode = window.require;

var gui = requireNode('nw.gui');
var win = gui.Window.get();
var nativeMenuBar = new gui.Menu({ type: "menubar" });

nativeMenuBar.createMacBuiltin('Kaku');
win.menu = nativeMenuBar;

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

// Auto-reload nwjs
var gulp = requireNode('gulp');

gulp.task('reload', function() {
  if (location) {
    location.reload();
  }
});

gulp.watch('dist/main.js', ['reload']);
