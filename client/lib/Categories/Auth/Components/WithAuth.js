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

import LocalStorage from '../../LocalStorage';
import { Auth } from 'aws-amplify';

/**
 * @param {React.Component} WrappedComponent 
 * @returns {React.Component}
 */
function WithAuth(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        ready: false,
        session: null,
      };

      this.handleOnSignIn = this.handleOnSignIn.bind(this);
      this.handleOnSignUp = this.handleOnSignUp.bind(this);
      this.handleOnSignOut = this.handleOnSignOut.bind(this);
    }

    async componentDidMount() {
      await LocalStorage.init();
      let session;
      try {
        session = await Auth.currentSession();
      } catch (err) {
        console.log(err);
        session = null;
      }
      this.setState({
        session,
        ready: true,
      });
    }

    handleOnSignIn(session) {
      this.setState({ session });
    }

    handleOnSignUp() { }

    handleOnSignOut() {
      Auth.signOut();
      this.setState({ session: null });
    }

    render() {
      const { ready, session } = this.state;
      console.log('Rendering HOC', ready, !!session);
      const {
        onSignIn,
        onSignUp,
        doSignOut,
        ...otherProps
      } = this.props;

      return (
        ready && (
          <WrappedComponent
            session={session}
            onSignIn={onSignIn || this.handleOnSignIn}
            onSignUp={onSignUp || this.handleOnSignUp}
            doSignOut={doSignOut || this.handleOnSignOut}
            auth={Auth}
            {...otherProps}
          />
        )
      );
    }
  }
}

export default WithAuth;
