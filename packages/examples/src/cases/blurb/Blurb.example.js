import React from 'react';
import ReactDOM from 'react-dom';
import { BlurbProvider, Blurb } from 'blurb';

const blurbs = [
  {
    id: 'blurb!93846',
    translation: 'hello Blurb'
  }
];

const makeQueryBlurb = aBlurb => ids =>
  new Promise(res => {
    setTimeout(() => {
      res(aBlurb.filter(blurb => ids.indexOf(blurb.id.slice(6)) >= 0));
    }, 500);
  });

const Demo = () => (
  <BlurbProvider queryBlurb={makeQueryBlurb(blurbs)}>
    <Blurb blurbID="93846" />
  </BlurbProvider>
);

const root = document.createElement('div');
root.className = 'app-root';
root.id = 'app-root';
document.body.appendChild(root);

ReactDOM.render(<Demo />, root);
