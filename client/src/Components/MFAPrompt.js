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
import React, { PropTypes } from 'react';
import Prompt from 'react-native-prompt';
import { Keyboard, View, Text, StyleSheet } from 'react-native';
import { FormInput } from 'react-native-elements';

const styles = StyleSheet.create({
  dialogContentView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const RESEND_TIMEOUT = 10000;

export default class MFAPrompt extends React.Component {

  static propTypes = {
    onValidate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
  }

  static defaultProps = {
    onValidate: () => null,
    onCancel: () => null,
    onSuccess: () => null,
  };

  constructor() {
    super();

    this.handleCancel = this.handleCancel.bind(this);
    this.handleValidateMFACode = this.handleValidateMFACode.bind(this);
  }

  state = {
    promptTitle: 'Enter code',
    code: '',
  }

  handleCancel() {
    Keyboard.dismiss();
    this.props.onCancel();
  }

  async handleValidateMFACode(code) {
    const validate = await this.props.onValidate(code);
    const validCode = validate === true;
    const promptTitle = validCode ?
      'Enter code' :
      `${validate} Enter code again`;

    this.setState({
      promptTitle
    }, () => {
      if (validCode) {
        this.props.onSuccess();
      }
    });

  }

  render() {
    return (
      <Prompt
        title={this.state.promptTitle}
        placeholder="Code"
        textInputProps={{
          keyboardType: 'numeric',
        }}
        visible={true}
        onCancel={this.handleCancel}
        onSubmit={this.handleValidateMFACode}
      />
    );
  }

}
