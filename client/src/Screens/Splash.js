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
import { View, Text, StyleSheet } from 'react-native';
import { NavigationActions } from 'react-navigation';

import Constants from '../Utils/constants';

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

class Splash extends React.Component {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    const { session } = this.props;

    try {
      await new Promise(async (resolve, reject) => setTimeout(() => {
        if (!session) {
          reject('No current session');
          return;
        }

        resolve();
      }, 3000));
    } catch (exception) {
      console.log('rejected', exception);
    }

    const loggedIn = session && session.isValid();

    this.setState({ isLoading: false });

    this._navigateTo(loggedIn ? 'Home' : 'FirstScreen');

  }

  _navigateTo(routeName) {
    this.props.navigation.navigate(routeName);
  }

  render() {
    return (
      this.state.isLoading && <View style={styles.splash}><Text>Loading {Constants.APP_NAME}...</Text></View>
    );
  }

}

export default Splash;
