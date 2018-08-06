const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = require('../config/webpack.config');

const includePattern = /^(.*)\.example\.jsx?$/;

const getEntryList = (dir, ret) => {
  const __files = fs.readdirSync(dir);
  __files.forEach(f => {
    const __f = path.join(dir, f);
    const stat = fs.statSync(__f);
    if (stat.isDirectory()) {
      getEntryList(__f, ret);
    } else if (stat.isFile()) {
      const matched = f.match(includePattern);
      if (matched) {
        ret[matched[1]] = __f; // eslint-disable-line
      }
    }
  });
};

const entries = {};

getEntryList(path.join(process.cwd(), 'src/cases'), entries);

config.entry = entries;
config.plugins.push(
  ...Object.keys(entries).map(
    k =>
      new HtmlWebpackPlugin({
        filename: `${k}.html`,
        chunks: [`${k}`],
        inject: true
      })
  )
);

new WebpackDevServer(webpack(config), {
  hot: true,
  noInfo: false,
  historyApiFallback: true
}).listen(9001, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Listening at localhost:9001`);
  }
});
