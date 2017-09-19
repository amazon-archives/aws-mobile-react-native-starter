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

import MFAPrompt from './MFAPrompt'
import Auth from '../../lib/Categories/Auth';
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

    try {
      await new Promise((resolve, reject) => {
        Auth.handleNewCustomerRegistration(username, password, { Name: 'email', Value: email }, { Name: 'phone_number', Value: phoneNumber }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          userConfirmed = !!result.userConfirmed;
          resolve();
        });
      });

      this.setState({ errorMessage: '' });
    } catch (exception) {
      this.setState({ errorMessage: exception.message });
      return;
    }

    this.setState({ showMFAPrompt: !userConfirmed });

    if (userConfirmed) {
      this.onSignUp();
    }

  }

  async handleMFAValidate(code = '') {
    try {
      await new Promise((resolve, reject) => {
        Auth.handleSubmitVerificationCode(this.state.username, code, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(result);
        });
      });

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
