const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const cesiumSource = 'node_modules/cesium/Source';
const NODE_ENV = process.env.NODE_ENV;
const prdWebpackConfig= {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'cesium-particle.min.js',
    libraryTarget: 'umd',  //模块输出方式
    umdNamedDefine: true
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      'cesium': path.resolve(__dirname, cesiumSource)
    },
    fallback: {
      fs: false
    }
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ],
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

module.exports = prdWebpackConfig;
