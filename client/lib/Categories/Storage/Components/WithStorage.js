import React from 'react';
import Storage from '../Storage';

/**
 * @param {React.Component} WrappedComponent 
 * @returns {React.Component}
 */
function WithStorage(WrappedComponent) {
  return class extends React.Component {
    render() {
      return (
        <WrappedComponent
          storage={Storage}
          {... this.props}
        />
      );
    }
  }
}

export default WithStorage;
