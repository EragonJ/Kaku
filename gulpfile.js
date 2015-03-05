var gulp = require('gulp');
var react = require('gulp-react');
var rjs = require('gulp-requirejs');

gulp.task('jsx', function() {
  return gulp.src('./src/frontend/jsx/**/*.jsx')
    .pipe(react({
       harmony: true
    }))
    .pipe(gulp.dest('./src/frontend/js/components'));
});

gulp.task('rjs', function() {
  rjs({
    name: 'main',
    baseUrl: './src/frontend/js',
    out: 'main.min.js',
    paths: {
      react: '../vendor/react/react.min'
    }
  })
  .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['jsx', 'rjs'], function() {
  // do nothing
});
