const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  context: path.join(__dirname, '../src'),
  output: {
    // path: path.join(__dirname, '../build/static'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    sourceMapFilename: '[name].map'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [require('autoprefixer')()]
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|ttf|eot|sv)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      ENV: '"development"',
      'process.env': {
        NODE_ENV: JSON.stringify('development')
      }
    })
  ]
};
