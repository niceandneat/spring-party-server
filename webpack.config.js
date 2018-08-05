const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: "development",
  externals: [nodeExternals()],
  target: 'node',
  entry: './src/server.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /dist/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['env']
          ]
        }
      }
    }]
  }
};