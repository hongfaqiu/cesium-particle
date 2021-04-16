const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'cesium-particle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'development',
};