var fs = require('fs');
var gulp = require('gulp');
var rjs = require('gulp-requirejs');
var compass = require('gulp-compass');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var rename = require("gulp-rename");
var nwBuilder = require('node-webkit-builder');
var htmlreplace = require('gulp-html-replace');
var sequence = require('gulp-sequence');

// TODO
// we have to double check **/*.js is a right expression or not
const SCSS_FILES = './src/frontend/scss/**/*.scss';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const BACKEND_JS_FILES = './src/backend/**/*.js';
const VENDOR_FILES = './src/frontend/vendor/**/*';
const COMPONENTS_FILES = './src/frontend/js/components/**/*.js';
const DIST_FILES = './dist';
const INDEX_TEMPLATE_FILE = './_index.html';
const INDEX_FILE = './index.html';

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
    .pipe(compass({
      config_file: './config/compass_config.rb',
      css: 'src/frontend/css',
      sass: 'src/frontend/scss'
    }))
    .pipe(gulp.dest('./src/frontend/css'));
});

gulp.task('override', function() {
  return gulp
    .src(INDEX_TEMPLATE_FILE)
    .pipe(htmlreplace({
      rjs: {
        src: 'dist/main',
        tpl: '<script data-main="%s" src="src/frontend/vendor/requirejs/require.js"></script>'
      }
    }))
    .pipe(rename(INDEX_FILE))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(SCSS_FILES, ['compass']);
  gulp.watch([
    FRONTEND_JS_FILES,
    BACKEND_JS_FILES,
    '!' + COMPONENTS_FILES
  ], ['default']);
});

gulp.task('package', function(done) {
  // TODO
  // we should make sure only *needed* stuffs are included
  var nw = new nwBuilder({
    files: ['./**/*', '!./build/**/*', '!./cache/**/*', '!./miscs/**/*'],
    platforms: ['osx64']
  });

  nw.on('log',  console.log);
  nw.build().then(function() {
    console.log('all done!');

    // TODO
    // fix this path later
    gulp
      .src('./miscs/mac/ffmpegsumo.so', {
        base: './miscs/mac'
      })
      .pipe(gulp.dest('./build/Kaku/osx64/Kaku.app/Contents/Frameworks/nwjs Framework.framework/Libraries'))
      .on('end', done);
  }).catch(function(error) {
    console.error(error);
    done();
  });
});

gulp.task('build', function(callback) {
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
  sequence(
    'cleanup',
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
