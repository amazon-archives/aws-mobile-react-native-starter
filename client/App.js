global.Buffer = global.Buffer || require('buffer').Buffer; // Required for aws sigv4 signing

import React from 'react';
import { DrawerNavigator } from 'react-navigation';

import { WithAuth } from './lib/Categories/Auth/Components';

import First from './src/Screens/First';
import Splash from './src/Screens/Splash';
import Home from './src/Screens/Home';
import SignOut from './src/Components/SignOut';
import ForgotPassword from './src/Components/ForgotPassword';

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
