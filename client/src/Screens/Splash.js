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
