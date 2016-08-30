const fs = require('fs');
const path = require('path');
const webpack = require("webpack");

let nodeModules = {};
fs.readdirSync('node_modules')
  .filter((x) => {
    return [
      '.bin',
      'jquery',
      'bootstrap',
      'bootstrap-notify',
      'bootbox'
    ].indexOf(x) === -1;
  })
  .forEach((mod) => {
    nodeModules[mod] = 'commonjs ' + mod;
  });

let config = {
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
