import { configure } from '@storybook/react';

const req = require.context('../src/', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

export default configure(loadStories, module);
