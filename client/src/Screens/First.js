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
import { Text, View, StyleSheet, Platform } from 'react-native';
import { NavigationActions, TabNavigator } from 'react-navigation';
import {
  Icon,
} from 'react-native-elements';
import SignIn from '../Components/LogIn';
import SignUp from '../Components/SignUp';
import { colors } from 'theme';

const styles = StyleSheet.create({
  tabBarLabel: { marginLeft: 9 },
  tabBarIconContainer: { flexDirection: 'row', alignItems: 'center', height: 30 },
});

const FirstScreen = TabNavigator({
  LogIn: {
    screen: (props) => {
      const { screenProps, navigation, ...otherProps } = props;

      return (
        <SignIn
          { ...screenProps }
          { ...otherProps }
          onLogIn={() => screenProps.rootNavigator.navigate('Home')}
        />
      );
    },
    navigationOptions: {
      tabBarLabel: 'Sign In',
      tabBarIcon: ({ tintColor }) => (
        <View style={styles.tabBarIconContainer}>
          <Icon type='font-awesome' name="sign-in" style={styles.tabBarIcon} color={tintColor} />
          {Platform.OS === 'ios' && <Text style={[styles.tabBarLabel, { color: tintColor }]}>SIGN IN</Text>}
        </View>
      ),
    },
  },
  SignUp: {
    screen: (props) => {
      const { screenProps, ...otherProps } = props;

      return (
        <SignUp
          { ...screenProps }
          { ...otherProps }
          onSignUp={() => otherProps.navigation.navigate('LogIn')}
        />
      )
    },
    navigationOptions: {
      tabBarLabel: 'Sign Up',
      tabBarIcon: ({ tintColor }) => (
        <View style={styles.tabBarIconContainer}>
          <Icon type='font-awesome' name="pencil-square-o" style={styles.tabBarIcon} color={tintColor} />
          {Platform.OS === 'ios' && <Text style={[styles.tabBarLabel, { color: tintColor }]}>SIGN UP</Text>}
        </View>
      )
    },
  },
}, {
    tabBarPosition: 'bottom',
    tabBarOptions: {
      tabStyle: { borderTopWidth: 0.5, borderTopColor: '#ededed' },
      showIcon: true,
      showLabel: Platform.OS !== 'ios',
      activeTintColor: colors.primary,
    },
  });

export default (props) => {
  const { screenProps, ...otherProps } = props;
  return <FirstScreen screenProps={{ ...screenProps, ...otherProps }} />
};
