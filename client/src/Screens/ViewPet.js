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
  StyleSheet,
  Image,
} from 'react-native';
import { colors } from 'theme';
import { Storage } from 'aws-amplify';

class ViewPet extends React.PureComponent {
  static navigationOptions = ({ navigation, screenProps }) => console.log(screenProps) || ({
    title: `Viewing ${navigation.state.params.pet.name}`,
  })
  render() {
    const { pet } = this.props.navigation.state.params;

    const uri = pet.picUrl;

    const dob = new Date(pet.dob);
    const years = (new Date()).getFullYear() - dob.getFullYear();
    const birthDay = `${years} years old, ${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`;

    return (
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image
            style={styles.image}
            source={uri ? { uri } : require('../../assets/images/profileicon.png')}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{pet.name || 'No name'}</Text>
            <Text style={styles.info}>{pet.breed || 'No breed'}</Text>
            <Text style={styles.info}>{birthDay}</Text>
            <Text style={styles.info}>{pet.gender || 'No gender'}</Text>
          </View>
        </View>
        <View style={styles.breaker} />
      </View>
    );
  }
}

const imageSize = 130;
const styles = StyleSheet.create({
  infoContainer: {
    paddingLeft: 20,
  },
  breaker: {
    height: 1,
    backgroundColor: colors.darkGray,
    marginVertical: 15,
    width: '100%',
  },
  topContainer: {
    flexDirection: 'row',
  },
  container: {
    padding: 20,
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: imageSize / 2,
  },
  title: {
    color: colors.darkGray,
    fontSize: 28,
    marginBottom: 20,
  },
  info: {
    color: colors.darkGray,
    marginBottom: 7,
  },
});

export default ViewPet;
