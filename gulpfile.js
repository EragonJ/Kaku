var fs = require('fs');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var rjs = require('gulp-requirejs');
var compass = require('gulp-compass');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var atomshell = require('gulp-atom-shell');
var htmlreplace = require('gulp-html-replace');
var sequence = require('gulp-sequence');
var merge = require('merge-stream');

var CURRENT_ENVIRONMENT = 'development';

// TODO
// we have to double check **/*.js is a right expression or not
const SCSS_FILES = './src/frontend/scss/**/*.scss';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const FRONTEND_CSS_FILES = './src/frontend/css/**/*.css';
const FRONTEND_FONTS_FILES = './src/frontend/fonts/**/*.*';
const FRONTEND_VENDOR_FILES = './src/frontend/vendor/**/*.*';
const FRONTEND_IMAGES_FILES = './src/frontend/images/**/*.*';
const BACKEND_JS_FILES = './src/backend/**/*.js';
const BACKEND_L10N_FILES = './src/backend/locales/**/*.*';
const DIST_FILES = './dist';
const INDEX_TEMPLATE_FILE = './_index.html';
const INDEX_FILE = './index.html';

function isProduction() {
  return CURRENT_ENVIRONMENT === 'production';
}

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
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('./dist/frontend'));
});

gulp.task('6to5:backend', function() {
  // we just want to move all files to the right place
  return gulp
    .src(BACKEND_JS_FILES)
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest('./dist/backend'));
});

gulp.task('linter', function() {
  return gulp
    .src([
      './src/frontend/js/**/*.js',
      './src/backend/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('copy:frontend', function() {
  var base = './dist/frontend/';
  var vendor = gulp.src(FRONTEND_VENDOR_FILES).pipe(gulp.dest(base + 'vendor'));
  var css = gulp.src(FRONTEND_CSS_FILES).pipe(gulp.dest(base + 'css'));
  var fonts = gulp.src(FRONTEND_FONTS_FILES).pipe(gulp.dest(base + 'fonts'));
  var images = gulp.src(FRONTEND_IMAGES_FILES).pipe(gulp.dest(base + 'images'));
  return merge(vendor, css, fonts, images);
});

gulp.task('copy:backend', function() {
  var base = './dist/backend/';
  var l10nFiles = gulp.src(BACKEND_L10N_FILES)
    .pipe(gulp.dest(base + 'locales'));
  return merge(l10nFiles);
});

gulp.task('rjs', function(done) {
  // all frontend + backend js -> main.js
  fs.readFile('./config/rjs_config.json', 'utf-8', function(error, rawData) {
    if (error) {
      console.log(error);
      return;
    }
    else {
      var rjsConfig = JSON.parse(rawData);
      rjs(rjsConfig)
        .pipe(gulp.dest('dist/'))
        .on('end', done);
    }
  });
});

gulp.task('compass', function() {
  return gulp
    .src(SCSS_FILES)
    .pipe(plumber())
    .pipe(compass({
      config_file: './config/compass_config.rb',
      css: 'src/frontend/css',
      sass: 'src/frontend/scss'
    }))
    .pipe(gulp.dest('./src/frontend/css'));
});

gulp.task('override', function() {
  // TODO
  // we have to minify css later
  return gulp
    .src(INDEX_TEMPLATE_FILE)
    .pipe(plumber())
    .pipe(gulpif(isProduction(), htmlreplace({
      css: [
        'dist/frontend/vendor/bootstrap/dist/css/bootstrap.min.css',
        'dist/frontend/vendor/components-font-awesome/css/font-awesome.min.css',
        'dist/frontend/vendor/video.js/dist/video-js/video-js.min.css',
        'dist/frontend/css/index.css'
      ],
      backend_js: [
        'dist/backend/main.js'
      ],
      frontend_js: {
        src: 'dist/main',
        tpl: '<script data-main="%s" src="dist/frontend/vendor/requirejs/require.js"></script>'
      }
    })))
    .pipe(rename(INDEX_FILE))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(SCSS_FILES, ['compass']);
  gulp.watch([
    FRONTEND_JS_FILES,
    BACKEND_JS_FILES,
    INDEX_TEMPLATE_FILE
  ], ['default']);
});

gulp.task('package', function(done) {
  // TODO
  // We have to fix more stuffs later after atomshell is updated
  return gulp.src(['./**/*', '!./build/**/*', '!./cache/**/*', '!./miscs/**/*'])
    .pipe(atomshell({
      version: '0.19.4',
      platform: 'darwin'
    }))
    .pipe(atomshell.zfsdest('build/app.zip'));
});

gulp.task('build', function(callback) {
  CURRENT_ENVIRONMENT = 'production';
  sequence(
    'cleanup',
    '6to5:frontend',
    '6to5:backend',
    'linter',
    'copy:frontend',
    'copy:backend',
    'rjs',
    'override',
    'package'
  )(callback);
});

gulp.task('default', function(callback) {
  CURRENT_ENVIRONMENT = 'development';
  sequence(
    'cleanup',
    '6to5:frontend',
    '6to5:backend',
    'compass',
    'linter',
    'copy:frontend',
    'copy:backend',
    'override'
  )(callback);
});
