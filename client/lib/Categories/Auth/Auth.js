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
import AWS from 'aws-sdk';
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser,
  CognitoUserSession,
  CognitoIdToken,
} from 'react-native-aws-cognito-js';

import awsmobile from '../../../aws-exports';
import LocalStorage from '../LocalStorage';

const userPool = new CognitoUserPool({
  UserPoolId: awsmobile.aws_user_pools_id,
  ClientId: awsmobile.aws_user_pools_web_client_id,
});
let cognitoUser = null;

/**********************
 * INIT *
 **********************/
const init = async function syncCognitoStorage() {
  const userPool = new CognitoUserPool({
    UserPoolId: awsmobile.aws_user_pools_id, // Your user pool id here
    ClientId: awsmobile.aws_user_pools_web_client_id, // Your client id here
  });

  await new Promise((resolve, reject) => userPool.storage.sync((e, r) => (e ? reject(e) : resolve(r))));

  const session = await new Promise(resolve => getSignInUserSession((e, s) => resolve(e ? null : s)));

  console.log('Auth init', !!session);
};

/**********************
 * Login methods *
 **********************/
function check(error) {
  const err = error.toString();
  if (/InvalidParameterException: Missing required parameter USERNAME$/.test(err)
    || (/UserNotFoundException?/.test(err))
    || (/NotAuthorizedException?/.test(err))) {
    return {
      invalidCredentialsMessage: 'Please enter valid username and Password.',
    }
  } else if (/CodeMismatchException: Invalid code or auth state for the user.$/.test(err)) {
    return {
      invalidCredentialsMessage: 'Invalid Verification Code',
    }
  } else if (/InvalidParameterException: Missing required parameter SMS_MFA_CODE$/.test(err)) {
    return {
      invalidCredentialsMessage: 'Verficiation code can not be empty',
    }
  } else if (/PasswordResetRequiredException: Password reset required for the user$/.test(err)) {
    return {
      invalidCredentialsMessage: 'Password reset required for the user',
    }
  }

  console.warn(error);
  return {
    invalidCredentialsMessage: 'There was a problem',
  };
}

const getCognitoCredentials = function getCognitoCredentials(session) {
  const loginCred = `cognito-idp.${awsmobile.aws_project_region}.amazonaws.com/${awsmobile.aws_user_pools_id}`;

  const cognitoParams = {
    IdentityPoolId: awsmobile.aws_cognito_identity_pool_id,
    Logins: {
      [loginCred]: session.getIdToken().getJwtToken(),
    },
  };

  return new AWS.CognitoIdentityCredentials(cognitoParams);
};

const setCredentials = function setCredentials(credentials) {
  return new Promise((resolve, reject) => {
    AWS.config.credentials = credentials;

    AWS.config.credentials.get((error) => {
      if (error) {
        console.error(error);
        reject(error);
        return;
      }

      const { accessKeyId, secretAccessKey, sessionToken } = AWS.config.credentials;
      const awsCredentials = {
        accessKeyId,
        secretAccessKey,
        sessionToken,
      };
      LocalStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));

      resolve(awsCredentials);
    });
  });
};

const getCredentials = async function getCredentials(session, callbacks, ctx) {
  LocalStorage.setItem('currSession', JSON.stringify(session));
  await setCredentials(getCognitoCredentials(session));

  LocalStorage.setItem('isLoggedIn', true);
  callbacks.onSuccess.call(ctx, session);
};

const loginCallbackFactory = function loginCallbackFactory(callbacks, ctx) {
  return {
    onSuccess: (result) => {
      console.log('result: ', result);
      getCredentials(result, callbacks, ctx);
    },

    onFailure: (error) => {
      console.log(error.toString());
      let displayError = check(error);
      callbacks.onFailure.call(ctx, displayError);
    },

    mfaRequired: (codeDeliveryDetails) => {
      callbacks.mfaRequired.call(ctx);
    }
  }
}

function handleSignIn(username, password, callbacks) {
  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password
  });
  cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  cognitoUser.authenticateUser(authenticationDetails, callbacks);
}

function sendMFAVerificationCode(code, callbacks, ctx) {
  const newCallbacks = {
    onFailure: error => callbacks.onFailure.call(ctx, error),
    onSuccess: result => getCredentials(result, callbacks, ctx),
  };
  cognitoUser.sendMFACode(code, newCallbacks);
  console.log("MFA Verification Code sent for verification");
}

/**********************
 * Registration methods *
 **********************/

function checkRegistrationError(error) {
  const err = error.toString();
  if (/UsernameExistsException: User already exists$/.test(err)) {
    return 'User already exists';
  } else if (/InvalidParameterException?/.test(err)) {
    return 'Password must contain atleast 8 characters';
  } else if (/InvalidPasswordException?/.test(err)) {
    return 'Password must contain atleast 8 characters, one lowercase, uppercase, numeric and special character';
  }
}

function handleNewCustomerRegistration(username, password, email, phone, registerCallBack) {
  const attributeList = [];
  const attributeEmail = new CognitoUserAttribute(email);
  const attributePhone = new CognitoUserAttribute(phone);

  if (email.Value) {
    attributeList.push(attributeEmail);
  }
  if (phone.Value) {
    attributeList.push(attributePhone);
  }

  userPool.signUp(username, password, attributeList, null, registerCallBack);
}

function handleSubmitVerificationCode(username, verificationCode, verificationCallback) {
  cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });
  cognitoUser.confirmRegistration(verificationCode, true, verificationCallback);
}

function handleResendVerificationCode(username, resendCodeCallback) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });
  cognitoUser.resendConfirmationCode(resendCodeCallback);
}

/*************************
 * Forgot Password methods *
 *************************/
const forgotPasswordFactoryCallback = function forgotPasswordFactoryCallback(forgotPasswordCallBack, ctx) {
  return {
    onSuccess: () => {
      console.log('Password reset successful');
      forgotPasswordCallBack.onSuccess.call(ctx, {
        resetSuccess: true
      });
    },
    onFailure: (err) => {
      console.log(err.toString());
      let invalidCodeOrPasswordMessage = checkResetPasswordError(err.toString());
      forgotPasswordCallBack.onFailure.call(ctx, invalidCodeOrPasswordMessage);
    },
    inputVerificationCode: (data) => {
      forgotPasswordCallBack.inputVerificationCode.call(ctx, data);
    }
  }
}

function checkResetPasswordError(error) {

  if ((/UserNotFoundException?/.test(error))
    || (/InvalidParameterException: Cannot reset password for the user as there is no registered?/.test(error))) {
    return { invalidCodeOrPasswordMessage: 'Invalid username' };
  } else if (/LimitExceededException: Attempt limit exceeded, please try after some time?/.test(error)) {
    return { invalidCodeOrPasswordMessage: 'Attempt limit exceeded, please try again later' };
  } else if (/CodeMismatchException?/.test(error)) {
    return { invalidCodeOrPasswordMessage: 'Invalid Verfication Code' };
  } else if (/InvalidParameterException: Cannot reset password for the user as there is no registered\/verified email or phone_number?$/.test(error)) {
    return { invalidCodeOrPasswordMessage: 'Cannot reset password for the user as there is no registered\/verified email or phone_number' };
  } else if ((/InvalidParameterException?/.test(error)) || (/InvalidPasswordException?$/.test(error))) {
    return { invalidCodeOrPasswordMessage: 'Password must contain 8 or more characters with atleast one lowercase,uppercase, numerical and special character' }
  }
}

function handleForgotPassword(username, forgotPasswordCallBack) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });
  cognitoUser.forgotPassword(forgotPasswordCallBack);
}

function handleForgotPasswordReset(username, verificationCode, newPassword, forgotPasswordCallBack) {
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });
  cognitoUser.confirmPassword(verificationCode, newPassword, forgotPasswordCallBack);
}

function getSessionFromTokens(sessionTokens) {
  return new CognitoUserSession({
    IdToken: new CognitoIdToken({ IdToken: sessionTokens.idToken.jwtToken }),
    RefreshToken: new CognitoIdToken({ IdToken: sessionTokens.refreshToken.token }),
    AccessToken: new CognitoIdToken({ IdToken: sessionTokens.accessToken.jwtToken }),
  });
}

/*****************
 * SignOut methods *
 *****************/
function handleSignOut() {
  const currSessionKeys = JSON.parse(LocalStorage.getItem('currSession'));

  const currSession = getSessionFromTokens(currSessionKeys);
  const cognitoCredentials = getCognitoCredentials(currSession);
  const cognitoUser = getCurrentUser();

  cognitoCredentials.clearCachedId();

  AWS.config.credentials = cognitoCredentials;

  cognitoUser.signOut();

  LocalStorage.removeItem('awsCredentials');
  LocalStorage.setItem('isLoggedIn', false);
}

function getCurrentUser() {
  const userPool = new CognitoUserPool({
    UserPoolId: awsmobile.aws_user_pools_id, // Your user pool id here
    ClientId: awsmobile.aws_user_pools_web_client_id, // Your client id here
  });

  return userPool.getCurrentUser();
}

function getSignInUserSession(callback) {
  const user = getCurrentUser();

  if (user) {
    user.getSession((err, res) => {
      getCredentials(res, { onSuccess: () => null });
      callback(err, res);
    });

    return;
  }

  console.log('Setting unauth credentials');
  setCredentials(new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsmobile.aws_cognito_identity_pool_id,
  }));
  LocalStorage.setItem('isLoggedIn', false);
  callback();
}

function isSignedIn() {
  return !!LocalStorage.getItem('isLoggedIn');
}

export {
  init, handleSignIn, loginCallbackFactory, sendMFAVerificationCode, handleResendVerificationCode, handleSubmitVerificationCode, checkRegistrationError, handleNewCustomerRegistration, forgotPasswordFactoryCallback, handleForgotPassword, handleForgotPasswordReset, handleSignOut, getSignInUserSession, isSignedIn, getCurrentUser,
};
