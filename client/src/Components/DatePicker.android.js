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