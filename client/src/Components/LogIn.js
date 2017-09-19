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

import MFAPrompt from './MFAPrompt';
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
    };

    this.baseState = this.state;

    this.handleLogInClick = this.handleLogInClick.bind(this);
    this.handleMFAValidate = this.handleMFAValidate.bind(this);
    this.handleMFACancel = this.handleMFACancel.bind(this);
    this.handleMFASuccess = this.handleMFASuccess.bind(this);
    this.doLogin = this.doLogin.bind(this);
    this.onLogIn = this.onLogIn.bind(this);
  }

  async doLogin() {
    const { auth } = this.props;
    const { username, password } = this.state;
    let errorMessage = '';
    let showMFAPrompt = false;
    let session = null;

    try {
      session = await new Promise((resolve, reject) => {
        auth.handleSignIn(username, password, auth.loginCallbackFactory({
          onSuccess(result) {
            console.log('loginCallbacks.onSuccess', result);
            session = result;
            resolve(session);
          },
          onFailure(exception) {
            console.log('loginCallbacks.onFailure', exception);
            reject(exception);
          },
          newPasswordRequired(data) {
            console.log('loginCallbacks.newPasswordRequired', data);
            reject('newPasswordRequired');
          },
          mfaRequired(challengeName, challengeParameters) {
            console.log('loginCallbacks.mfaRequired', challengeName, challengeParameters);
            showMFAPrompt = true;
            resolve();
          },
        }, this));
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

  async onLogIn() {
    this.setState(this.baseState);

    this.props.onLogIn();
  }

  async handleMFAValidate(code = '') {
    const { auth } = this.props;

    try {
      const session = await new Promise((resolve, reject) => {
        auth.sendMFAVerificationCode(code, {
          onFailure(err) {
            reject(err);
          },
          onSuccess(result) {
            resolve(result);
          },
        }, this);
      });

      this.setState({ session });
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
