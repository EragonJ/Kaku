// By doing so, we won't mess up with `require` keyword
window.requireNode = window.require;

// auto reload
var gulp;
var remote = requireNode('remote');

try {
  gulp = requireNode('gulp');
} catch(e) {
  // There is no gulp in production build, so we have to use
  // try-catch to throw errors in console for this
}

if (gulp) {
  gulp.task('reload', function() {
    remote.getCurrentWindow().reload();
  });

  gulp.watch([
    'src/frontend/**/*.*',
    'src/backend/**/*.*'
  ], ['reload']);
}
