import React, { PropTypes } from 'react';
import Prompt from 'react-native-prompt';

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

  constructor(props) {
    super(props);

    this.handleCancel = this.handleCancel.bind(this);
    this.handleValidateMFACode = this.handleValidateMFACode.bind(this);
  }

  state = {
    promptTitle: 'Enter code',
    code: '',
  }

  handleCancel() {
    this.props.onCancel();
  }

  async handleValidateMFACode(code) {
    try {
      const result = await this.props.onValidate(code);

      this.props.onSuccess(result);
    } catch (err) {
      this.setState({ promptTitle: `${err.message} Enter code again` });
    }

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
