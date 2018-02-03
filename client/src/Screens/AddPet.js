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
import {
  View,
  Text,
  CameraRoll,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Dimensions,
  Image,
  ScrollView,
  ImageStore,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  FormLabel,
  FormInput,
  FormValidationMessage,
  Button,
  Icon,
  ButtonGroup,
} from 'react-native-elements';
import RNFetchBlob from 'react-native-fetch-blob';
import uuid from 'react-native-uuid';
import mime from 'mime-types';

import { colors } from 'theme';
import { API, Storage } from 'aws-amplify';
import files from '../Utils/files';
import awsmobile from '../aws-exports';
import DatePicker from '../Components/DatePicker';

const { width, height } = Dimensions.get('window');

let styles = {};

class AddPet extends React.Component {
  static navigationOptions = {
    title: 'Add Pet',
  }

  state = {
    selectedImage: {},
    selectedImageIndex: null,
    images: [],
    selectedGenderIndex: null,
    modalVisible: false,
    input: {
      name: '',
      dob: null,
      breed: '',
      gender: '',
    },
    showActivityIndicator: false,
  }

  updateSelectedImage = (selectedImage, selectedImageIndex) => {
    if (selectedImageIndex === this.state.selectedImageIndex) {
      this.setState({
        selectedImageIndex: null,
        selectedImage: {}
      })
    } else {
      this.setState({
        selectedImageIndex,
        selectedImage,
      });
    }
  }

  updateInput = (key, value) => {
    this.setState((state) => ({
      input: {
        ...state.input,
        [key]: value,
      }
    }))
  }

  getPhotos = () => {
    CameraRoll
      .getPhotos({
        first: 20,
      })
      .then(res => {
        this.setState({ images: res.edges })
        this.props.navigation.navigate('UploadPhoto', { data: this.state, updateSelectedImage: this.updateSelectedImage })
      })
      .catch(err => console.log('error getting photos...:', err))
  }

  toggleModal = () => {
    this.setState(() => ({ modalVisible: !this.state.modalVisible }))
  }

  readImage(imageNode = null) {
    if (imageNode === null) {
      return Promise.resolve();
    }

    const { image } = imageNode;
    const result = {};

    if (Platform.OS === 'ios') {
      result.type = mime.lookup(image.filename);
    } else {
      result.type = imageNode.type;
    }

    const extension = mime.extension(result.type);
    const imagePath = image.uri;
    const picName = `${uuid.v1()}.${extension}`;
    const key = `${picName}`;

    return files.readFile(imagePath)
      .then(buffer => Storage.put(key, buffer, { level: 'private', contentType: result.type }))
      .then(fileInfo => ({ key: fileInfo.key }))
      .then(x => console.log('SAVED', x) || x);
  }

  AddPet = async () => {
    const petInfo = this.state.input;
    const { node: imageNode } = this.state.selectedImage;

    this.setState({ showActivityIndicator: true });

    this.readImage(imageNode)
      .then(fileInfo => ({
        ...petInfo,
        picKey: fileInfo && fileInfo.key,
      }))
      .then(this.apiSavePet)
      .then(data => {
        this.setState({ showActivityIndicator: false });
        this.props.screenProps.handleRetrievePet();
        this.props.screenProps.toggleModal();
      })
      .catch(err => {
        console.log('error saving pet...', err);
        this.setState({ showActivityIndicator: false });
      });
  }

  async apiSavePet(pet) {
    return await API.post('Pets', '/items/pets', { body: pet });
  }

  updateGender = (index) => {
    let gender = 'female';
    if (index === this.state.selectedGenderIndex) {
      index = null;
      gender = '';
    }
    else if (index === 1) {
      gender = 'male';
    }
    this.setState((state) => ({
      selectedGenderIndex: index,
      input: {
        ...state.input,
        gender,
      }
    }))
  }


  render() {
    const { selectedImageIndex, selectedImage, selectedGenderIndex } = this.state;

    return (
      <View style={{ flex: 1, paddingBottom: 0 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text style={styles.title}>Add New Pet</Text>
          <TouchableWithoutFeedback
            onPress={this.getPhotos}
          >
            {
              selectedImageIndex === null ? (
                <View style={styles.addImageContainer}>
                  <Icon size={34} name='camera-roll' color={colors.grayIcon} />
                  <Text style={styles.addImageTitle}>Upload Photo</Text>
                </View>
              ) : (
                  <Image
                    style={styles.addImageContainer}
                    source={{ uri: selectedImage.node.image.uri }}
                  />
                )
            }

          </TouchableWithoutFeedback>
          <FormLabel>Name</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter you pet's name"
            returnKeyType="next"
            ref="name"
            textInputRef="nameInput"
            onChangeText={(name) => this.updateInput('name', name)}
            value={this.state.input.name}
          />
          <FormLabel>Date Of Birth</FormLabel>
          <DatePicker
            inputStyle={styles.input}
            selectionColor={colors.primary}
            value={this.state.input.dob}
            ref="datepicker"
            onDateChange={date => this.updateInput('dob', date)}>
          </DatePicker>
          <FormLabel>Breed</FormLabel>
          <FormInput
            inputStyle={styles.input}
            selectionColor={colors.primary}
            autoCapitalize="none"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            editable={true}
            placeholder="Please enter your pet's breed"
            returnKeyType="next"
            ref="breed"
            textInputRef="breedInput"
            onChangeText={(breed) => this.updateInput('breed', breed)}
            value={this.state.input.breed}
          />
          <FormLabel>Gender</FormLabel>
          <View style={styles.buttonGroupContainer}>
            <ButtonGroup
              innerBorderStyle={{ width: 0.5 }}
              underlayColor='#0c95de'
              containerStyle={{ borderColor: '#d0d0d0' }}
              selectedTextStyle={{ color: 'white', fontFamily: 'lato' }}
              selectedBackgroundColor={colors.primary}
              onPress={this.updateGender}
              selectedIndex={this.state.selectedGenderIndex}
              buttons={['female', 'male']}
            />
          </View>
          <Button
            fontFamily='lato'
            containerViewStyle={{ marginTop: 20 }}
            backgroundColor={colors.primary}
            large
            title="Add Pet"
            onPress={this.AddPet}
          />
          <Text
            onPress={this.props.screenProps.toggleModal}
            style={styles.closeModal}>Dismiss</Text>
        </ScrollView>
        <Modal
          visible={this.state.showActivityIndicator}
          onRequestClose={() => null}
        >
          <ActivityIndicator
            style={styles.activityIndicator}
            size="large"
          />
        </Modal>
      </View>
    );
  }
}

styles = StyleSheet.create({
  buttonGroupContainer: {
    marginHorizontal: 8,
  },
  addImageContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.lightGray,
    borderColor: colors.mediumGray,
    borderWidth: 1.5,
    marginVertical: 14,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageTitle: {
    color: colors.darkGray,
    marginTop: 3,
  },
  closeModal: {
    color: colors.darkGray,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    marginLeft: 20,
    marginTop: 19,
    color: colors.darkGray,
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    fontFamily: 'lato',
  },
  activityIndicator: {
    backgroundColor: colors.mask,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default AddPet;
