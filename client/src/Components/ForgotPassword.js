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
import { Image, View, ScrollView, Text, StyleSheet, Dimensions } from 'react-native';
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button,
} from 'react-native-elements';

import MFAPrompt from '../../lib/Categories/Auth/Components/MFAPrompt';
import { colors } from 'theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
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
    height: 190,
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
  cancelButton: {
    color: colors.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  resetInfoMessage: {
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 11,
  },
});

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      signedInUser: null,
      username: '',
      password: '',
      errorMessage: '',
      showMFAPrompt: false,
    };

    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleMFAValidate = this.handleMFAValidate.bind(this);
    this.handleMFACancel = this.handleMFACancel.bind(this);
    this.handleMFASuccess = this.handleMFASuccess.bind(this);
  }

  async componentDidMount() {
    const signedInUser = await this.getCurrentUser();

    this.setState({ signedInUser });
  }

  getCurrentUser() {
    return this.props.auth.currentUser()
      .catch((err) => { return null });
  }

  handleResetClick() {
    const { auth } = this.props;
    const { username, signedInUser: user } = this.state;
    const send = user ? user.username : username;
    auth.forgotPassword(send)
      .then(this.setState({ showMFAPrompt: true }))
      .catch((err) => { console.log(err) });
  }

  async handleMFAValidate(code = '') {
    const { auth } = this.props;
    const { username, password, signedInUser: user } = this.state;
    const send = user ? user.username : username;
    try {
      await auth.forgotPasswordSubmit(send, code, password);
    } catch (err) {
      return err;
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
      this.props.onSuccess();
    });
  }

  render() {
    const { signedInUser: user } = this.state;

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            resizeMode='contain'
            source={require('../../assets/images/puppy.png')}
            style={styles.puppy}
          />
        </View>
        <Text style={styles.resetInfoMessage}>{user ? 'Change your password' : 'Please enter your username and we’ll help you reset your password.'}</Text>
        <FormValidationMessage labelStyle={styles.validationText}>{this.state.errorMessage}</FormValidationMessage>
        <View style={styles.formContainer}>
          <FormLabel>Username</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={user == null}
            placeholder="Please enter your username"
            returnKeyType="next"
            ref="username"
            textInputRef="usernameInput"
            onSubmitEditing={() => { this.refs.password.refs.passwordInput.focus() }}
            onChangeText={(username) => this.setState({ username })}
            value={user ? user.username : this.state.username}
          />
          <FormLabel>New password</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            editable={true}
            placeholder="Please enter your new password"
            returnKeyType="next"
            ref="password"
            textInputRef="passwordInput"
            onChangeText={(password) => this.setState({ password })}
            value={this.state.password}
          />
          <Button
            fontFamily='lato'
            containerViewStyle={{ marginTop: 20 }}
            backgroundColor={colors.primary}
            large
            title="RESET"
            onPress={this.handleResetClick}
          />
          {this.state.showMFAPrompt &&
            <MFAPrompt
              onValidate={this.handleMFAValidate}
              onCancel={this.handleMFACancel}
              onSuccess={this.handleMFASuccess}
            />}
          <Text
            onPress={() => this.props.onCancel()}
            style={styles.cancelButton}
          >Cancel</Text>
        </View>
      </ScrollView>
    );
  }
}

export default ForgotPassword;

