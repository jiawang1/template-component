import React from 'react';
import { storiesOf } from '@storybook/react';

storiesOf('Blurb', module).add('test', () => {
  class Test extends React.Component {
    constructor() {
      super();
      this.state = {
        count: 0
      };
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
      console.log('get snapshot before update');
      return null;
    }

    componentDidUpdate(preProps, preState) {
      console.log('component did updated');
    }

    onClick() {
      console.log(this.state.count);
      this.setState(
        pre => ({ count: pre.count + 1 }),
        () => {
          console.log('set state call back');
        }
      );
    }

    render() {
      console.log('render function');
      return (
        <div>
          <button
            onClick={() => {
              this.onClick();
            }}
          >
            test
          </button>
          <span>{this.state.count}</span>
        </div>
      );
    }
  }

  return <Test />;
});
