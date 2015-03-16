var gulp = require('gulp');
var rjs = require('gulp-requirejs');
var compass = require('gulp-compass');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var sequence = require('gulp-sequence');
var through2 = require('through2');

const SCSS_FILES = './src/frontend/scss/**/*.scss';
const JSX_FILES = './src/frontend/jsx/**/*.js';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const BACKEND_JS_FILES = './src/backend/**/*.js';
const COMPONENTS_FILES = './src/frontend/js/components/**/*.js';
const DIST_FILES = './dist/**/*.js';

gulp.task('cleanup', function() {
  return gulp
    .src([DIST_FILES, COMPONENTS_FILES, '!./src/frontend/js/main.js'], {
      read: false
    })
    .pipe(clean());
});

gulp.task('jsx', function() {
  // jsx -> js
  return gulp
    .src(JSX_FILES)
    .pipe(babel())
    .pipe(gulp.dest('./src/frontend/js/components'));
});

gulp.task('6to5', function() {
  // all frontend js in es6 -> es5
  return gulp
    .src(FRONTEND_JS_FILES)
    .pipe(babel())
    .pipe(gulp.dest('./src/frontend/js'));
});

gulp.task('rjs', function() {
  // all frontend + backend js -> main.js
  rjs({
    name: 'main',
    baseUrl: './src/frontend/js',
    out: 'main.js',
    paths: {
      react: '../vendor/react/react',
      backend: '../../backend',
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
    JSX_FILES,
    FRONTEND_JS_FILES,
    BACKEND_JS_FILES,
    '!' + COMPONENTS_FILES
  ], ['default']);
});

gulp.task('default', sequence('cleanup', 'jsx', '6to5', 'rjs'));
