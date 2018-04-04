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
  Text,
  TextInput,
  Button,
} from 'react-native';

import WithAuth from '../WithAuth';
import MFAPrompt from '../MFAPrompt';
import styles from './styles';

class SignUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      email: '',
      phone: '',
      errorMessage: null,
    };

    this.resolver = () => null;

    this.handleSignUp = this.handleSignUp.bind(this);
    this.doSignUp = this.doSignUp.bind(this);

    this.handleMFAValidate = this.handleMFAValidate.bind(this);
    this.handleMFACancel = this.handleMFACancel.bind(this);
    this.handleMFASuccess = this.handleMFASuccess.bind(this);
  }

  doSignUp(username, password, email, phone) {
    const { auth } = this.props;
    const [emailVal, phoneVal] = [{ Name: 'email', Value: email }, { Name: 'phone_number', Value: phone }];

    return new Promise(async (outResolve, reject) => {
      this.resolver = outResolve;

      const result = await new Promise((resolve) => {
        auth.handleNewCustomerRegistration(username, password, emailVal, phoneVal, (err, res) => {
          if (err) {
            reject(Error(err.message));
            return;
          }

          resolve(res);
        });
      });

      const userConfirmed = !!result.userConfirmed;

      this.setState({ showMFAPrompt: !userConfirmed });

      if (userConfirmed) {
        this.resolver(result.user);
      }
    });
  }

  async handleSignUp() {
    const { username, password, email, phone } = this.state;

    try {
      const user = await this.doSignUp(username, password, email, phone);
      this.props.onSignUp();

      console.log('CLIENT', 'Signed Up: ' + (user ? 'YES' : 'NO'));
    } catch (err) {
      console.log('CLIENT', err.message);
      this.setState({ errorMessage: err.message });
    }
  }

  handleMFAValidate(code = '') {
    const { username } = this.state;
    const { auth } = this.props;

    return new Promise((resolve, reject) => {
      auth.handleSubmitVerificationCode(username, code, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      });
    });
  }

  handleMFACancel() {
    this.setState({ showMFAPrompt: false });

    this.resolver(null);
  }

  handleMFASuccess(session) {
    this.resolver(session);

    this.setState({ showMFAPrompt: false });
  }

  render() {
    return (
      <View {...this.props} style={[styles.container, this.props.style]}>
        {this.state.showMFAPrompt &&
          <MFAPrompt
            onValidate={this.handleMFAValidate}
            onCancel={this.handleMFACancel}
            onSuccess={this.handleMFASuccess}
          />}
        <View style={styles.fieldsContainer}>
          <Text>Username</Text>
          <TextInput placeholder="Username" value={this.state.username} onChangeText={v => this.setState({ username: v })} autoCapitalize='none' autoCorrect={false} />
          <Text>Password</Text>
          <TextInput placeholder="Password" value={this.state.password} onChangeText={v => this.setState({ password: v })} secureTextEntry={true} />
          <Text>Email</Text>
          <TextInput placeholder="Email" value={this.state.email} onChangeText={v => this.setState({ email: v })} autoCapitalize='none' autoCorrect={false} keyboardType='email-address' />
          <Text>Phone</Text>
          <TextInput placeholder="Phone" value={this.state.phone} onChangeText={v => this.setState({ phone: v })} autoCapitalize='none' autoCorrect={false} keyboardType='numeric' />
          <Button title="Sign Up" onPress={this.handleSignUp} />
          <Text>{this.state.errorMessage}</Text>
        </View>
      </View>
    );
  }
};

export default WithAuth(SignUp);
