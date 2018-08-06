const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');

const config = require('../config/webpack.config');

const appPath = process.cwd();
const distPath = path.join(appPath, 'dist');
const srcPath = path.join(appPath, 'src');

const cleanUp = () => {
  if (fs.existsSync(distPath)) {
    shell.rm('-rf', distPath);
  }
  shell.mkdir(distPath);
};

cleanUp();
config.context = srcPath;
config.output = {
  path: distPath,
  filename: `${process.env.npm_package_name}.min.js`,
  library: process.env.npm_package_name
    .split('-')
    .map(word => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(''),
  libraryTarget: 'umd'
};

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      const info = stats.toJson();
      if (stats.hasErrors()) {
        console.error(info.errors);
        throw new Error(info.errors);
      }
      if (stats.hasWarnings()) {
        console.log(info.warnings);
      }
    }
  } else {
    console.log('build finished');
  }
});
