const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.less$/,
        loaders: ['style-loader', 'css-loader', 'less-loader'],
        include: path.resolve(__dirname, '../')
      },
      {
        test: /\.(?:svg|jpg|png|bmp|gif)$/,
        loaders: ['file-loader'],
        include: path.resolve(__dirname, '../')
      }
    ]
  }
};
