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
import { DatePickerAndroid, View } from 'react-native';
import { FormInput } from 'react-native-elements';

export default class DatePicker extends React.Component {

  constructor(props) {
    super(props);

    this.showPicker = this.showPicker.bind(this);
  }

  async showPicker() {
    this.refs.forminput.refs.input.blur();

    const result = await DatePickerAndroid.open({
      date: this.props.value || new Date(),
      maxDate: new Date(),
      mode: 'calendar',
    });

    if (result.action === DatePickerAndroid.dateSetAction) {
      const date = new Date(result.year, result.month, result.day);

      this.props.onDateChange(date);
    }
  }

  render() {
    return <View>
      <FormInput
        inputStyle={this.props.inputStyle}
        selectionColor={this.props.selectionColor}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid="transparent"
        editable={true}
        placeholder="mm/dd/yyyy"
        ref="forminput"
        textInputRef="input"
        onFocus={this.showPicker}
        value={this.props.value && `${this.props.value.getMonth() + 1}/${this.props.value.getDate()}/${this.props.value.getFullYear()}`}
      />
    </View>;
  }

}