const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const NODE_ENV = process.env.NODE_ENV;
const prdWebpackConfig= {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.join(__dirname, 'lib'),
    filename: "cesium-particle.js",
    libraryTarget: 'commonjs2'  //模块输出方式
  },
  externals: {
    cesium: 'cesium' //打包时候排除cesium
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: []
};

if (NODE_ENV !== 'publish') {
  prdWebpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = prdWebpackConfig;
