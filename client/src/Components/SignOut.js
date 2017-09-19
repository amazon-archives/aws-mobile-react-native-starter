import React from 'react';
import { Text } from 'react-native';

export default class SignOut extends React.Component {
  componentDidMount() {
    const { auth } = this.props.screenProps;
    auth.handleSignOut();

    this.props.rootNavigator.navigate('FirstScreen');
  }

  render() {
    return <Text>Sign Out</Text>;
  }
}
