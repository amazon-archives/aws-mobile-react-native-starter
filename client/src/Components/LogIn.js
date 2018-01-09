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
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button,
} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';

import MFAPrompt from '../../lib/Categories/Auth/Components/MFAPrompt';
import ForgotPassword from './ForgotPassword';
import { colors } from 'theme';
import Constants from '../Utils/constants';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  bla: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  activityIndicator: {
    backgroundColor: colors.mask,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  formContainer: {
    height: 250,
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },
  input: {
    fontFamily: 'lato',
  },
  validationText: {
    fontFamily: 'lato',
  },
  puppy: {
    width: width / 2,
    height: width / 2,
  },
  imageContainer: {
    alignItems: 'center',
  },
  passwordResetButton: {
    color: colors.primary,
    marginTop: 10,
    textAlign: 'center',
  },
});

class LogIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showActivityIndicator: false,
      username: '',
      password: '',
      showMFAPrompt: false,
      errorMessage: '',
      cognitoUser: '',
    };

    this.baseState = this.state;

    this.handleLogInClick = this.handleLogInClick.bind(this);
    this.handleMFAValidate = this.handleMFAValidate.bind(this);
    this.handleMFACancel = this.handleMFACancel.bind(this);
    this.handleMFASuccess = this.handleMFASuccess.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.onLogIn = this.onLogIn.bind(this);
  }

  async onLogIn() {
    this.setState(this.baseState);

    this.props.onLogIn();
  }

  async doLogin() {
    const { auth } = this.props;
    const { username, password } = this.state;
    let errorMessage = '';
    let showMFAPrompt = false;
    let session = null;

    try {
      session = await auth.signIn(username, password)
        .then((data) => {
          console.log('we get cognitouse:', data),
            this.setState({ cognitoUser: data }),
            showMFAPrompt = true;
          console.log('login mfaRequired');
        });
    } catch (exception) {
      console.log(exception);
      errorMessage = exception.invalidCredentialsMessage || exception.message || exception;
    }

    this.setState({
      showMFAPrompt,
      errorMessage,
      session,
      showActivityIndicator: false,
    }, () => {
      if (session) {
        this.onLogIn();
      }
    });
  }

  handleLogInClick() {
    this.setState({ showActivityIndicator: true });

    setTimeout(this.doLogin, 0);
  }

  async handleMFAValidate(code = '') {
    const { auth } = this.props;

    try {
      let session = null;
      await auth.confirmSignIn(this.state.cognitoUser, code)
        .then(async () => {
          session = await auth.currentSession();
          this.setState({ session });
        });
    } catch (exception) {
      return exception.message;
    }

    return true;
  }

  handleMFACancel() {
    this.setState({ showMFAPrompt: false });
  }

  handleMFASuccess() {
    this.setState({
      showMFAPrompt: false,
    }, () => {
      this.onLogIn();
    });
  }

  render() {
    return (
      <View style={styles.bla}>
        {this.state.showMFAPrompt &&
          <MFAPrompt
            onValidate={this.handleMFAValidate}
            onCancel={this.handleMFACancel}
            onSuccess={this.handleMFASuccess}
          />}
        <Modal
          visible={this.state.showActivityIndicator}
          onRequestClose={() => null}
        >
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
          />
        </Modal>
        <View style={styles.imageContainer}>
          <Image
            resizeMode='contain'
            source={require('../../assets/images/puppy.png')}
            style={styles.puppy}
          />
        </View>
        <View style={styles.formContainer}>
          <FormValidationMessage labelStyle={styles.validationText}>{this.state.errorMessage}</FormValidationMessage>
          <FormLabel>Username</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter your username"
            returnKeyType="next"
            ref="username"
            textInputRef="usernameInput"
            onSubmitEditing={() => { this.refs.password.refs.passwordInput.focus() }}
            onChangeText={(username) => this.setState({ username })}
            value={this.state.username} />
          <FormLabel>Password</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            underlineColorAndroid="transparent"
            editable={true}
            secureTextEntry={true}
            placeholder="Please enter your password"
            returnKeyType="next"
            ref="password"
            textInputRef="passwordInput"
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password} />
          <Button
            fontFamily='lato'
            containerViewStyle={{ marginTop: 20 }}
            backgroundColor={colors.primary}
            large
            title="SIGN IN"
            onPress={this.handleLogInClick} />
          <Text
            onPress={() => this.props.navigation.navigate('ForgotPassword')}
            style={styles.passwordResetButton}
          >Forgot your password?</Text>
        </View>
      </View>
    );
  }

}

const LogInStack = (StackNavigator({
  LogIn: {
    screen: (props) => {
      const { screenProps, ...otherProps } = props;

      return <LogIn {...screenProps} {...otherProps} />;
    },
    navigationOptions: {
      title: Constants.APP_NAME,
    },
  },
  ForgotPassword: {
    screen: (props) => {
      const { screenProps, ...otherProps } = props;

      return <ForgotPassword {...screenProps} {...otherProps} onCancel={() => otherProps.navigation.goBack()} onSuccess={() => otherProps.navigation.goBack()} />;
    },
    navigationOptions: {
      title: Constants.APP_NAME,
    },
  },
}, { mode: 'modal' }));

export default props => <LogInStack screenProps={{ ...props }} />;
