var gulp = require('gulp');
var react = require('gulp-react');
var rjs = require('gulp-requirejs');
var compass = require('gulp-compass');

const SCSS_FILES = './src/frontend/scss/**/*.scss';
const JSX_FILES = './src/frontend/jsx/**/*.jsx';
const JS_FILES = './src/frontend/js/**/*.js';
const COMPONENTS_FILES = './src/frontend/js/components/**/*.js';

gulp.task('jsx', function() {
  gulp
    .src(JSX_FILES)
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
      react: '../vendor/react/react'
    }
  })
  .pipe(gulp.dest('dist/'));
});

gulp.task('compass', function() {
  gulp
    .src(SCSS_FILES)
    .pipe(compass({
      config_file: './config.rb',
      css: 'src/frontend/css',
      sass: 'src/frontend/scss'
    }))
    .pipe(gulp.dest('./src/frontend/css'));
});

gulp.task('watch', function() {
  gulp.watch(SCSS_FILES, ['compass']);
  gulp.watch(JSX_FILES, ['jsx', 'rjs']);
  gulp.watch([
    JS_FILES,
    '!' + COMPONENTS_FILES
  ], ['rjs']);
});

gulp.task('default', ['jsx', 'rjs'], function() {
  // do nothing
});
