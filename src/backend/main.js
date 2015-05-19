// By doing so, we won't mess up with `require` keyword
window.requireNode = window.require;

// auto reload
var remote = requireNode('remote');
var gulp = requireNode('gulp');


gulp.task('reload', function() {
  remote.getCurrentWindow().reload();
});

gulp.watch([
  'src/frontend/**/*.*',
  'src/backend/**/*.*'
], ['reload']);
