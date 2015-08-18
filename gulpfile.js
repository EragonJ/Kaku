var fs = require('fs');
var argv = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var gulpif = require('gulp-if');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var electron = require('gulp-atom-electron');
var sequence = require('gulp-sequence');
var newer = require('gulp-newer');

var webpack = require('webpack');

var path = require('path');
var packageJSON = require('./package.json');
var webpackConfig = require('./webpack.config');

var CURRENT_ENVIRONMENT = 'development';

function isProduction() {
  return CURRENT_ENVIRONMENT === 'production';
}

gulp.task('cleanup:build', function() {
  return gulp
    .src(['./build'], {
      read: false
    })
    .pipe(clean());
});

gulp.task('less', function() {
  var dest = './src/public/css/';
  return gulp
    .src('./src/public/less/**/*.less')
    .pipe(newer('./src/public/css/index.css'))
    .pipe(less({
      paths: [
        path.join('./src/public/less/includes')
      ]
    }))
    .pipe(gulp.dest(dest));
});

gulp.task('webpack', function(callback) {
  if (isProduction()) {
    var minifier = new webpack.optimize.UglifyJsPlugin({
      minimize: true
    });
    webpackConfig.plugins.push(minifier);
  }
  else {
    webpackConfig.devtool = 'sourcemap';
  }

  webpack(webpackConfig, function(error) {
    if (error) {
      throw error;
    }
    else {
      callback();
    }
  });
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
    '!./tests/**'
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
  var iconFolderPath = './src/public/images/icons';

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
      './src/modules/**/*.js',
      './src/models/**/*.js',
      './src/views/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('linter:test', function() {
  return gulp
    .src([
      './tests/**/*.js',
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

gulp.task('production', function(callback) {
  CURRENT_ENVIRONMENT = 'production';
  sequence(
    'cleanup:build',
    'linter:src',
    'env',
    'webpack'
  )(callback);
});

gulp.task('default', function(callback) {
  CURRENT_ENVIRONMENT = 'development';
  sequence(
    'less',
    'linter:src',
    'env',
    'webpack'
  )(callback);
});

gulp.task('build', function(callback) {
  sequence(
    'production',
    'package'
  )(callback);
});
