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
var nwBuilder = require('node-webkit-builder');
var htmlreplace = require('gulp-html-replace');
var sequence = require('gulp-sequence');
var changed = require('gulp-changed');

var CURRENT_ENVIRONMENT = 'development';

// TODO
// we have to double check **/*.js is a right expression or not
const SCSS_FILES = './src/frontend/scss/**/*.scss';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const BACKEND_JS_FILES = './src/backend/**/*.js';
const VENDOR_FILES = './src/frontend/vendor/**/*';
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
    .pipe(changed(dest))
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(dest));
});

gulp.task('6to5:backend', function() {
  var dest = './dist/backend';
  // we just want to move all files to the right place
  return gulp
    .src(BACKEND_JS_FILES)
    .pipe(changed(dest))
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

gulp.task('copy:vendor', function() {
  var dest = './dist/vendor';
  return gulp
    .src(VENDOR_FILES)
    .pipe(changed(dest))
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
        tpl: '<script data-main="%s" src="src/frontend/vendor/requirejs/require.js"></script>'
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
  // Because I just migrate from nw.js to electron, I have to fix this later

  // we should make sure only *needed* stuffs are included
  // var nw = new nwBuilder({
  //   files: ['./**/*', '!./build/**/*', '!./cache/**/*', '!./miscs/**/*'],
  //   platforms: ['osx64']
  // });

  // nw.on('log',  console.log);
  // nw.build().then(function() {
  //   console.log('all done!');

  //   // TODO
  //   // fix this path later
  //   gulp
  //     .src('./miscs/mac/ffmpegsumo.so', {
  //       base: './miscs/mac'
  //     })
  //     .pipe(gulp.dest('./build/Kaku/osx64/Kaku.app/Contents/Frameworks/nwjs Framework.framework/Libraries'))
  //     .on('end', done);
  // }).catch(function(error) {
  //   console.error(error);
  //   done();
  // });
});

gulp.task('build', function(callback) {
  CURRENT_ENVIRONMENT = 'production';
  sequence(
    'cleanup',
    '6to5:frontend',
    '6to5:backend',
    'linter',
    'copy:vendor',
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
    'linter',
    'copy:vendor',
    'override'
  )(callback);
});

// TODO
// we have to add `compass` task back in building process
// and have to use build:css to replace all css into one
