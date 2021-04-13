const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpackcommon = require('./webpack-common');

module.exports = {
  ...webpackcommon,
  output: {
    filename: '[name]/index.js',
    path: path.resolve(__dirname, '../dist/dist'),
    libraryTarget: 'commonjs' // IMPORTANT!
  },
  plugins: [
    new CopyPlugin({
      patterns:[
        { from: '*/function.json', to: '../' },
      { from: 'host.json', to: '../'},
      { from: 'package.json', to: '../'},
      { from: 'proxies.json', to: '../'}
      ]
      
})
  ]
};