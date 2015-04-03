var gulp = require('gulp');
var rjs = require('gulp-requirejs');
var compass = require('gulp-compass');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var sequence = require('gulp-sequence');
var through2 = require('through2');

const SCSS_FILES = './src/frontend/scss/**/*.scss';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const BACKEND_JS_FILES = './src/backend/**/*.js';
const VENDOR_FILES = './src/frontend/vendor/**/*';
const COMPONENTS_FILES = './src/frontend/js/components/**/*.js';
const DIST_FILES = './dist/**/*.js';

gulp.task('cleanup', function() {
  return gulp
    .src([DIST_FILES], {
      read: false
    })
    .pipe(clean());
});

gulp.task('6to5:frontend', function() {
  return gulp
    .src(FRONTEND_JS_FILES)
    .pipe(babel({
      // we only process react here
      whitelist: ['react']
    }))
    .pipe(gulp.dest('./dist/frontend'));
});

gulp.task('6to5:backend', function() {
  // we just want to move all files to the right place
  return gulp
    .src(BACKEND_JS_FILES)
    .pipe(gulp.dest('./dist/backend'));
});

gulp.task('linter', function() {
  return gulp
    .src(['./dist/frontend/**/*.js', './dist/backend/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('copy:vendor', function() {
  return gulp
    .src(VENDOR_FILES)
    .pipe(gulp.dest('./dist/vendor'));
});

gulp.task('rjs', function() {
  // all frontend + backend js -> main.js
  return rjs({
    name: 'main',
    baseUrl: './dist/frontend',
    out: 'main.js',
    paths: {
      react: '../vendor/react/react',
      backend: '../backend',
    }
  })
  .pipe(through2.obj(function (file, enc, next) {
    this.push(file);
    this.end();
    next();
  }))
  .pipe(gulp.dest('dist/'));
});

gulp.task('compass', function() {
  return gulp
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
  gulp.watch([
    FRONTEND_JS_FILES,
    BACKEND_JS_FILES,
    '!' + COMPONENTS_FILES
  ], ['default']);
});

gulp.task('default', function(callback) {
  sequence(
    'cleanup',
    '6to5:frontend',
    '6to5:backend',
    'linter',
    'copy:vendor',
    'rjs'
  )(callback);
});
