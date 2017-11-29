/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import React from 'react';
import { AppState, Platform } from 'react-native'

import { Analytics } from '../';
import Auth from '../../Auth';

let appStateEventLitenerAdded = false;

/**
 * @param {React.Component} WrappedComponent 
 * @returns {React.Component}
 */
function WithAnalytics(WrappedComponent) {

  return class extends React.Component {

    state = {
      initialized: false,
      appState: AppState.currentState
    }

    async componentDidMount() {
      if (appStateEventLitenerAdded) {
        return;
      }

      await Auth.init();
      AppState.addEventListener('change', this._handleAppStateChange);

      this._handleAppStateChange(this.state.appState);

      appStateEventLitenerAdded = true;
      this.setState({ initialized: true });
    }

    componentWillUnmount() {
      const { initialized } = this.state;

      if (!initialized) {
        return;
      }

      AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
      Analytics.handleSessionStateChange(nextAppState, Platform.OS);

      this.setState({ appState: nextAppState });
    }

    render() {
      return (
        <WrappedComponent
          {... this.props}
        />
      );
    }
  }
}

export default WithAnalytics;
