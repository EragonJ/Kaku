var fs = require('fs');
var argv = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var gulpif = require('gulp-if');
var debug = require('gulp-debug');
var rjs = require('gulp-requirejs');
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
var livereload = require('gulp-livereload');

var path = require('path');
var packageJSON = require(path.join(__dirname, 'package.json'));

var CURRENT_ENVIRONMENT = 'development';

const LESS_FILES = './src/frontend/less/**/*.less';
const FRONTEND_LESS_FOLDER = './src/frontend/less';
const FRONTEND_JS_FILES = './src/frontend/js/**/*.js';
const FRONTEND_CSS_FILES = './src/frontend/css/**/*.css';
const BACKEND_JS_FILES = './src/backend/**/*.js';
const BACKEND_L10N_FILES = './src/backend/locales/**/*.*';
const DIST_FILES = './dist';
const BUILD_FILES = './build';
const INDEX_TEMPLATE_FILE = './_index.html';
const INDEX_FILE = './index.html';

function isProduction() {
  return CURRENT_ENVIRONMENT === 'production';
}

gulp.task('cleanup:dist', function() {
  return gulp
    .src([DIST_FILES], {
      read: false
    })
    .pipe(clean());
});

gulp.task('cleanup:build', function() {
  return gulp
    .src([BUILD_FILES], {
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

gulp.task('less', function() {
  var dest = './src/frontend/css/';
  return gulp
    .src(LESS_FILES)
    .pipe(newer(dest + 'index.css'))
      .pipe(less({
      paths: [ path.join(FRONTEND_LESS_FOLDER, 'includes') ]
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
        'dist/frontend/css/index.css'
      ],
      frontend_js: {
        src: 'dist/main',
        tpl: '<script data-main="%s" src="node_modules/requirejs/require.js"></script>'
      },
      livereload: []
    })))
    .pipe(rename(INDEX_FILE))
    .pipe(gulp.dest('./'));
});

// NOTE
// This task should be used with watch task
gulp.task('reload', function() {
  livereload.reload();
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(LESS_FILES, ['less', 'reload']);
  gulp.watch([
    FRONTEND_JS_FILES,
    BACKEND_JS_FILES,
    INDEX_TEMPLATE_FILE
  ], ['default', 'reload']);
});

gulp.task('env', function(cb) {
  var envInfo = {
    env: CURRENT_ENVIRONMENT
  };
  fs.writeFile('env.json', JSON.stringify(envInfo), cb);
});

gulp.task('package', function(done) {
  var devDependencies = packageJSON.devDependencies;
  var devDependenciesKeys = Object.keys(devDependencies);
  var includedFiles = [
    '**/*',
    '!./build/**',
    '!./tests/**',
    '!./src/**'
  ];

  // Let's ignore files listed inside devDependencies
  devDependenciesKeys.forEach(function(key) {
    includedFiles.push('!./node_modules/' + key + '/**');
  });

  var arch = process.arch || 'ia32';
  var platform = argv.platform || process.platform;
  platform = platform.toLowerCase();

  switch (platform) {
    case 'mac':
    case 'darwin':
      platform = 'darwin';
      arch = 'x64';
      break;
    case 'freebsd':
    case 'linux':
      platform = 'linux';
      break;
    case 'linux32':
      platform = 'linux';
      arch = 'ia32';
      break;
    case 'linux64':
      platform = 'linux';
      arch = 'x64';
      break;
    case 'win':
    case 'win32':
    case 'windows':
      platform = 'win32';
      arch = 'ia32';
      break;
    default:
      console.log('We don\'t support your platform ' + platform);
      process.exit(1);
      break;
  }

  console.log('Building kaku for ' + platform + '-' + arch);

  // We will keep all stuffs in dist/ instead of src/ for production
  var iconFolderPath =
    path.join(__dirname, 'dist', 'frontend', 'images', 'icons');

  // TODO
  // We have to fix more stuffs later after atomshell is updated
  return gulp.src(includedFiles).pipe(electron({
    version: '0.30.0',
    platform: platform,
    arch: arch,
    // for Mac
    darwinIcon: path.join(iconFolderPath, 'kaku.icns'),
    // for windows
    winIcon: path.join(iconFolderPath, 'kaku.ico'),
    companyName: 'Kaku',
    copyright: 'MIT'
  })).pipe(electron.zfsdest('build/app.zip'));
});

gulp.task('linter:src', function() {
  return gulp
    .src([
      './src/frontend/js/**/*.js',
      './src/backend/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('linter:test', function() {
  return gulp
    .src([
      './tests/backend/**/*.js',
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('linter:all', function(callback) {
  sequence(
    'linter:src',
    'linter:test'
  )(callback);
});

gulp.task('build', function(callback) {
  CURRENT_ENVIRONMENT = 'production';
  sequence(
    'cleanup:dist',
    'cleanup:build',
    '6to5:frontend',
    '6to5:backend',
    'linter:src',
    'copy:frontend',
    'copy:backend',
    'env',
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
    'less',
    'linter:src',
    'copy:frontend',
    'copy:backend',
    'env',
    'override'
  )(callback);
});
