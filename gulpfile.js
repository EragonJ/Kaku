var gulp = require('gulp');
var react = require('gulp-react');
var rjs = require('gulp-requirejs');
var compass = require('gulp-compass');

gulp.task('jsx', function() {
  gulp
    .src('./src/frontend/jsx/**/*.jsx')
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

gulp.task('compass', function() {
  gulp
    .src('./src/frontend/scss/**/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'src/frontend/css',
      sass: 'src/frontend/scss'
    }))
    .pipe(gulp.dest('./src/frontend/css'));
});

gulp.task('default', ['jsx', 'rjs'], function() {
  // do nothing
});
