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
  TextInput,
  Image,
} from 'react-native';
import {
  Icon,
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button,
} from 'react-native-elements';
import { StackNavigator } from 'react-navigation';

import MFAPrompt from '../../lib/Categories/Auth/Components/MFAPrompt';
import { Auth } from 'aws-amplify';
import Constants from '../Utils/constants';
import { colors } from 'theme';

const styles = StyleSheet.create({
  bla: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  formContainer: {
    justifyContent: 'space-around',
    height: 420,
  },
});

class SignUp extends React.Component {
  static navigationOptions = {
    title: Constants.APP_NAME,
  }
  constructor(props) {
    super(props);

    this.state = {
      showMFAPrompt: false,
      username: '',
      password: '',
      email: '',
      phoneNumber: '',
      errorMessage: '',
    };

    this.baseState = this.state;

    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleMFAValidate = this.handleMFAValidate.bind(this);
    this.handleMFASuccess = this.handleMFASuccess.bind(this);
    this.handleMFACancel = this.handleMFACancel.bind(this);
    this.onPhoneSubmit = this.onPhoneSubmit.bind(this);
  }

  async handleSignUp() {
    const { username, password, email, phoneNumber } = this.state;
    let userConfirmed = true;

    Auth.signUp(username, password, email, phoneNumber)
      .then(data => {
        userConfirmed = data.userConfirmed;

        this.setState({ showMFAPrompt: !userConfirmed });

        if (userConfirmed) {
          this.onSignUp();
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ errorMessage: err.message });
        return;
      });
  }

  async handleMFAValidate(code = '') {
    try {
      await Auth.confirmSignUp(this.state.username, code)
        .then(data => console.log('sign up successful ->', data));
    } catch (exception) {
      return exception.message || exception;
    }

    return true;
  }

  handleMFACancel() {
    this.setState({ showMFAPrompt: false })
  }

  handleMFASuccess() {
    this.setState({ showMFAPrompt: false });

    this.onSignUp();
  }

  onSignUp() {
    this.setState(this.baseState);

    this.props.onSignUp();
  }

  checkPhonePattern = (phone) => {
    return /\+[1-9]\d{1,14}$/.test(phone);
  }

  onPhoneSubmit(event) {
    const isValidPhone = this.checkPhonePattern(event.nativeEvent.text);

    this.setState({ errorMessage: !isValidPhone && 'Please enter a phone number with the format +(countrycode)(number) such as +12223334444' });
  }

  render() {
    return (
      <View style={styles.bla}>
        <View style={styles.formContainer}>
          <View>
            <FormValidationMessage>{this.state.errorMessage}</FormValidationMessage>
            <FormLabel>Username</FormLabel>
            <FormInput
              editable
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
              placeholder="Enter your Username"
              returnKeyType="next"
              ref="username"
              textInputRef="usernameInput"
              onSubmitEditing={() => { this.refs.password.refs.passwordInput.focus() }}
              value={this.state.username}
              onChangeText={username => this.setState({ username })} />
            {false && <FormValidationMessage>Error message</FormValidationMessage>}
          </View>
          <View>
            <FormLabel>Password</FormLabel>
            <FormInput
              editable
              autoCapitalize="none"
              underlineColorAndroid="transparent"
              placeholder="Enter your Password"
              returnKeyType="next"
              ref="password"
              textInputRef="passwordInput"
              onSubmitEditing={() => { this.refs.email.refs.emailInput.focus() }}
              secureTextEntry
              value={this.state.password}
              onChangeText={password => this.setState({ password })} />
            {false && <FormValidationMessage>Error message</FormValidationMessage>}
          </View>
          <View>
            <FormLabel>Email</FormLabel>
            <FormInput
              editable
              autoCapitalize="none"
              keyboardType="email-address"
              underlineColorAndroid="transparent"
              placeholder="Enter your Email"
              returnKeyType="next"
              ref="email"
              textInputRef="emailInput"
              onSubmitEditing={() => { this.refs.phone.refs.phoneInput.focus() }}
              value={this.state.email}
              onChangeText={email => this.setState({ email })} />
            {false && <FormValidationMessage>Error message</FormValidationMessage>}
          </View>
          <View>
            <FormLabel>Phone Number</FormLabel>
            <FormInput
              editable
              autoCapitalize="none"
              keyboardType="phone-pad"
              underlineColorAndroid="transparent"
              placeholder="Enter your Phone Number"
              returnKeyType="next"
              ref="phone"
              textInputRef="phoneInput"
              value={this.state.phoneNumber}
              onBlur={this.onPhoneSubmit}
              onSubmitEditing={this.onPhoneSubmit}
              onChangeText={phoneNumber => this.setState({ phoneNumber })} />
            {false && <FormValidationMessage>Error message</FormValidationMessage>}
          </View>
          <Button
            raised
            large
            title="Sign Up"
            backgroundColor={colors.primary}
            icon={{ name: 'lock', size: 18, type: 'font-awesome' }}
            onPress={this.handleSignUp} />
          {this.state.showMFAPrompt &&
            <MFAPrompt
              onValidate={this.handleMFAValidate}
              onCancel={this.handleMFACancel}
              onSuccess={this.handleMFASuccess}
            />}
        </View>
      </View>
    );
  }
}

const SignUpStack = StackNavigator({
  SignUp: {
    screen: props => <SignUp {...props} onSignUp={props.screenProps.onSignUp} />,
    navigationOptions: {
      title: Constants.APP_NAME,
    }
  },
});

export default props => <SignUpStack screenProps={{ onSignUp: props.onSignUp }} />;
