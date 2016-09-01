var fs = require('fs');
var path = require('path');
var webpack = require("webpack");

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return [
      '.bin',
      'jquery',
      'bootstrap',
      'bootstrap-notify',
      'bootbox'
    ].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

var config = {
  entry: './src/main.js',
  output: {
    path: __dirname,
    filename: 'kaku.bundled.js'
  },
  externals: nodeModules,
  target: 'atom',
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
    })
  ]
};

module.exports = config;
