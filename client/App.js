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
global.Buffer = global.Buffer || require('buffer').Buffer; // Required for aws sigv4 signing

import React from 'react';
import { DrawerNavigator } from 'react-navigation';

import { WithAuth } from './lib/Categories/Auth/Components';
import Amplify from 'aws-amplify';
import awsmobile from './src/aws-exports';
import First from './src/Screens/First';
import Splash from './src/Screens/Splash';
import Home from './src/Screens/Home';
import SignOut from './src/Components/SignOut';
import ForgotPassword from './src/Components/ForgotPassword';

Amplify.configure(awsmobile);

const App = DrawerNavigator({
  Home: {
    screen: props => <Home rootNavigator={props.navigation} {...props.screenProps } />,
  },
  ForgotPassword: {
    screen: (props) => {
      return <ForgotPassword {...props.screenProps} onCancel={() => props.navigation.navigate('Home')} onSuccess={() => props.navigation.navigate('Home')} />
    }, navigationOptions: { drawerLabel: 'Change password' }
  },
  SignOut: {
    screen: (props) => {
      return <SignOut rootNavigator={props.navigation} {...props} />
    }, navigationOptions: { drawerLabel: 'Sign Out' }
  },
  Splash: {
    screen: props => <Splash navigation={props.navigation} { ...props.screenProps } />,
    navigationOptions: {
      drawerLabel: ' ',
    },
  },
  FirstScreen: {
    screen: props => <First rootNavigator={props.navigation} screenProps={{ ...props.screenProps }} />,
    navigationOptions: {
      drawerLabel: ' ',
    },
  },
}, { initialRouteName: 'Splash' });

const AppContainer = props => <App screenProps={{ ...props }} />;

export default WithAuth(AppContainer);
