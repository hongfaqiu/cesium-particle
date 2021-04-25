// 参考https://cesium.com/blog/2016/01/26/cesium-and-webpack/
// https://www.jianshu.com/p/85917bcc023f

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

module.exports = {
  entry: './example/app.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    //需要编译Cesium中的多行字符串 
    sourcePrefix: ''
  },
  amd: {
      //允许Cesium兼容 webpack的require方式 
      toUrlUndefined: true
  },
  mode: 'development',
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'cesium': path.resolve(__dirname, cesiumSource)
    },
    fallback: {
      fs: false
    }
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test:/\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './example/index.html',
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopyWebpackPlugin({
      patterns: [
        { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
        { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
        { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
        { from: path.join('./src', 'glsl'), to: 'glsl' }
      ],
    }),
    new webpack.DefinePlugin({
        //Cesium载入静态的资源的相对路径
        CESIUM_BASE_URL: JSON.stringify('')
    }),
    new webpack.HotModuleReplacementPlugin(), // 热更新插件
  ],
  devtool: 'inline-source-map', // map文件追踪错误提示
  devServer: {
    contentBase: './dist',      // 开发环境的服务目录
    historyApiFallback: true,
    inline: true,
    port: 9000
  }
};