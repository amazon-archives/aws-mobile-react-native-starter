import React from 'react';
import { StyleSheet, View, TouchableOpacity, Button, DatePickerIOS, Modal } from 'react-native';
import { FormInput } from 'react-native-elements';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }
});

export default class DatePicker extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      date: props.value || new Date(),
      pickerVisible: false,
    };

    this.setDate = this.setDate.bind(this);
  }

  setDate() {
    this.setState({
      pickerVisible: false,
    });

    this.props.onDateChange(this.state.date);
  }

  render() {
    return <View>
      <Modal visible={this.state.pickerVisible}>
        <View style={styles.container}>
          <DatePickerIOS date={this.state.date} maximumDate={new Date()} mode={'date'} onDateChange={date => this.setState({ date })} />
          <View>
            <Button title="Ok" onPress={this.setDate} />
            <Button title="Cancel" onPress={() => this.setState({ pickerVisible: false })} />
          </View>
        </View>
      </Modal>
      <FormInput
        inputStyle={this.props.inputStyle}
        selectionColor={this.props.selectionColor}
        autoCapitalize="none"
        autoCorrect={false}
        underlineColorAndroid="transparent"
        editable={true}
        placeholder="mm/dd/yyyy"
        onFocus={() => this.setState({ pickerVisible: true, date: this.props.value || new Date() })}
        value={this.props.value && `${this.props.value.getMonth() + 1}/${this.props.value.getDate()}/${this.props.value.getFullYear()}`}
      />
    </View>;
  }

}