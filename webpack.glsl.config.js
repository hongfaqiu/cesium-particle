const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'packages/shader/index.js'),
  output: {
    path: path.join(__dirname, 'src/shader/'),
    filename: 'shader.min.js',
    libraryTarget: 'commonjs'  //模块输出方式
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(frag|vert)$/,
        loader: 'webpack-glsl-loader'
      }
    ]
  }
};
