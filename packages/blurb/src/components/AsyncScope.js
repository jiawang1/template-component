import React from 'react';
import PropTypes from 'prop-types';

class AsyncScope extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    if (console) {
      console.error(false, 'AsyncScope is obsoleted, Provider can support Asynchronize loading');
    }
    return this.props.children;
  }
}

AsyncScope.propTypes = {
  children: PropTypes.node.isRequired
};

export default AsyncScope;
