import React from 'react';
import API from '../API';

/**
 * @param {React.Component} WrappedComponent 
 * @returns {React.Component}
 */
function WithAPI(WrappedComponent) {
  return class extends React.Component {
    render() {
      return (
        <WrappedComponent
          api={API}
          {... this.props}
        />
      );
    }
  }
}

export default WithAPI;
