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

/**
 * React component for SignIn with support for Multi-Factor Authentication (MFA)
 */
class SignIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      errorMessage: null,
    };

    this.resolver = () => null;

    this.handleSignIn = this.handleSignIn.bind(this);
    this.doSignIn = this.doSignIn.bind(this);

    this.handleMFAValidate = this.handleMFAValidate.bind(this);
    this.handleMFACancel = this.handleMFACancel.bind(this);
    this.handleMFASuccess = this.handleMFASuccess.bind(this);
  }

  /**
   * Signs in a user with a username.password combination. If needed, takes care of MFA.
   *
   * @param {string} username 
   * @param {string} password 
   */
  doSignIn(username, password) {
    const { auth } = this.props;
    let showMFAPrompt = false;

    return new Promise(async (outResolve, reject) => {
      this.resolver = outResolve;

      const session = await new Promise((resolve) => {
        auth.handleSignIn(username, password, auth.loginCallbackFactory({
          onSuccess(session) {
            console.log('loginCallbacks.onSuccess', session);
            resolve(session);
          },
          onFailure(err) {
            console.log('loginCallbacks.onFailure', err);
            reject(new Error(err.invalidCredentialsMessage || err.message || err));
          },
          newPasswordRequired(data) {
            reject(new Error('newPasswordRequired'));
          },
          mfaRequired(challengeName, challengeParameters) {
            showMFAPrompt = true;
            resolve();
          },
        }, this));
      });

      this.setState({ showMFAPrompt }, () => {
        if (session) {
          this.resolver(session);
        }
      });
    });
  }

  async handleSignIn() {
    const { username, password } = this.state;

    try {
      const session = await this.doSignIn(username, password);
      this.props.onSignIn(session);

      console.log('CLIENT', 'Signed In: ' + (session ? 'YES' : 'NO'));
    } catch (err) {
      console.log('CLIENT', err.message);
      this.setState({ errorMessage: err.message });
    }
  }

  handleMFAValidate(code = '') {
    const { auth } = this.props;

    return new Promise((resolve, reject) => auth.sendMFAVerificationCode(code, { onFailure: reject, onSuccess: resolve }, this));
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
          <Button title="Sign In" onPress={this.handleSignIn} />
          <Text>{this.state.errorMessage}</Text>
        </View>
      </View>
    );
  }
};

export default WithAuth(SignIn);
