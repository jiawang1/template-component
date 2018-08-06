const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: ['./index']
  },
  context: path.join(__dirname, '../src'),
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    },
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom'
    }
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
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [require('autoprefixer')()]
              }
            }
          ]
        })
      },
      {
        test: /\.(png|jpg|gif|ttf|eot|sv)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new ExtractTextPlugin({ filename: `${process.env.npm_package_name}.css` }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.DefinePlugin({
      ENV: '"production"',
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};
