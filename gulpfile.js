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
var electron = require('gulp-atom-electron');
var htmlreplace = require('gulp-html-replace');
var sequence = require('gulp-sequence');
var newer = require('gulp-newer');

var CURRENT_ENVIRONMENT = 'development';

// TODO
// we have to double check **/*.js is a right expression or not
const SCSS_FILES = './src/frontend/scss/**/*.scss';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const FRONTEND_CSS_FILES = './src/frontend/css/**/*.css';
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
  var dest = './dist/frontend';
  return gulp
    .src(FRONTEND_JS_FILES)
    .pipe(newer(dest))
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(dest));
});

gulp.task('6to5:backend', function() {
  var dest = './dist/backend';
  return gulp
    .src(BACKEND_JS_FILES)
    .pipe(newer(dest))
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(dest));
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
  var dest = './dist/frontend/';
  return gulp
    .src('./src/frontend/+(vendor|css|fonts|images)/**/*.*')
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
});

gulp.task('copy:backend', function() {
  var dest = './dist/backend/';
  return gulp
    .src('./src/backend/+(locales)/**/*.*')
    .pipe(newer(dest))
    .pipe(gulp.dest(dest));
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
  var dest = './src/frontend/css/';
  return gulp
    .src(SCSS_FILES)
    .pipe(newer(dest + 'index.css'))
    .pipe(plumber())
    .pipe(compass({
      config_file: './config/compass_config.rb',
      css: 'src/frontend/css',
      sass: 'src/frontend/scss'
    }))
    .pipe(gulp.dest(dest));
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
        'dist/frontend/vendor/animate.css/animate.min.css',
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
  return gulp.src([
    './**/*.*',
    '!./build/**/*.*',
    '!./tests/**/*.*',
    '!./node_modules/gulp-*/**.*'
  ]).pipe(electron({
    version: '0.19.4',
    platform: 'darwin'
  })).pipe(electron.zfsdest('build/app.zip'));
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
    '6to5:frontend',
    '6to5:backend',
    'compass',
    'linter',
    'copy:frontend',
    'copy:backend',
    'override'
  )(callback);
});
