var fs = require('fs-extra');
var argv = require('yargs').argv;
var gulp = require('gulp');
var less = require('gulp-less');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var sequence = require('gulp-sequence');
var pathLength = require('gulp-path-length');
var packager = require('electron-packager');
var shell = require('shelljs');
var useref = require('gulp-useref');
var kakuApp = require('electron-connect').server.create();
var newer = require('gulp-newer');
var webpack = require('webpack');

var path = require('path');
var packageJSON = require('./package.json');
var webpackConfig = require('./webpack.config');

var CURRENT_ENVIRONMENT = 'development';
var finalAppPaths = [];

function isProduction() {
  return CURRENT_ENVIRONMENT === 'production';
}


// We need to check pathLength when building Kaku for Windows users.
// Ref: http://engineroom.teamwork.com/dealing-with-long-paths/
gulp.task('checkPathLength', function() {
  return gulp
    .src('./**', {
       read: false
    })
    .pipe(pathLength());
});

gulp.task('html', function() {
  var assets = useref.assets();

  return gulp
    .src('./_index.html')
    .pipe(gulpif(isProduction(), assets))
    .pipe(gulpif(isProduction(), assets.restore()))
    .pipe(gulpif(isProduction(), useref()))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./'));
});

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

gulp.task('watch', function() {
  kakuApp.start();

  // create a child process for webpack --watch
  shell.exec('webpack --watch', {
    async: true
  });

  // reload when files are changed
  gulp.watch([
    './kaku.bundled.js',
    './index.html',
    './src/public/css/**'
  ], kakuApp.reload);

  // reload when styles are changed
  gulp.watch([
    './src/public/less/**'
  ], ['less']);
});

gulp.task('package', function(done) {
  var devDependencies = packageJSON.devDependencies;
  var devDependenciesKeys = Object.keys(devDependencies);
  var ignoreFiles = [
    './build',
    './tests',
    './kaku'
  ];

  devDependenciesKeys.forEach(function(key) {
    ignoreFiles.push('node_modules/' + key);
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

  // We will keep all stuffs in dist/ instead of src/ for production
  var iconFolderPath = './src/public/images/icons';
  var iconPath;

  if (platform === 'darwin') {
    iconPath = path.join(iconFolderPath, 'kaku.icns');
  }
  else {
    iconPath = path.join(iconFolderPath, 'kaku.ico');
  }

  var ignorePath = ignoreFiles.join('|');
  var ignoreRegexp = new RegExp(ignorePath, 'ig');

  packager({
    'dir': './',
    'name': 'Kaku',
    'platform': platform,
    'asar': true,
    'asar-unpack-dir': 'node_modules/youtube-dl',
    'arch': arch,
    'version': '0.30.0',
    'out': './build',
    'icon': iconPath,
    'app-bundle-id': 'kaku',
    'app-version': packageJSON.version,
    'build-version': packageJSON.version,
    'helper-bundle-id': 'kaku',
    'ignore': ignoreRegexp,
    'overwrite': true,
    'version-string': {
      'CompanyName': 'Kaku',
      'LegalCopyright': 'MIT',
      'FileDescription': 'Kaku is a cross platform music player',
      'FileVersion': packageJSON.version,
      'ProductVersion': packageJSON.version,
      'ProductName': 'Kaku',
      'InternalName': 'Kaku'
    }
  }, function(error, appPaths) {
    if (error) {
      console.log(error);
      process.exit(1);
    }
    else {
      // TODO
      // we should support to build all platforms at once later !
      // something like [ 'build/Kaku-darwin-x64' ]
      finalAppPaths = appPaths;
      done();
    }
  });
});

gulp.task('post-package', function(done) {
  var currentLicenseFile = path.join(__dirname, 'LICENSE');

  var promises = finalAppPaths.map(function(appPath) {
    var targetLicenseFile = path.join(appPath, 'LICENSE');
    var promise = new Promise(function(resolve, reject) {
      fs.copy(currentLicenseFile, targetLicenseFile, function(error) {
        if (error) {
          reject(error);
        }
        else {
          resolve();
        }
      });
    });
    return promise;
  });

  Promise.all(promises).then(function() {
    done();
  }).catch(function(error) {
    console.log(error)
    process.exit(1);
  });
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
    .pipe(jshint({
      'node': true,
      'mocha': true
    }))
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
    'less',
    'html',
    'env',
    'webpack'
  )(callback);
});

gulp.task('default', function(callback) {
  CURRENT_ENVIRONMENT = 'development';
  sequence(
    'linter:src',
    'less',
    'html',
    'env',
    'webpack'
  )(callback);
});

gulp.task('build', function(callback) {
  sequence(
    'production',
    'package',
    'post-package'
  )(callback);
});
