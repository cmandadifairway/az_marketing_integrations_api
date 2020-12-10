const path = require('path');
const webpackcommon = require('./webpack-common');

module.exports = {
  ...webpackcommon,
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, '../dist'),
    libraryTarget: 'commonjs' // IMPORTANT!
  }
};