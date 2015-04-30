// By doing so, we won't mess up with `require` keyword
window.requireNode = window.require;

// auto reload
var gulp = requireNode('gulp');

gulp.task('reload', function() {
  if (location) {
    location.reload();
  }
});

gulp.watch([
  'dist/frontend',
  'dist/backend'
], ['reload']);
