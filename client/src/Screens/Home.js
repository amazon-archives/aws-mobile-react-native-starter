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
  ScrollView,
  Text,
  Animated,
  StyleSheet,
  Image,
  Easing,
  TouchableHighlight,
  Modal,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { DrawerNavigator, NavigationActions, StackNavigator } from 'react-navigation';

import { API, Storage } from 'aws-amplify';
import AddPet from './AddPet';
import ViewPet from './ViewPet';
import UploadPhoto from '../Components/UploadPhoto';
import SideMenuIcon from '../Components/SideMenuIcon';
import awsmobile from '../aws-exports';
import { colors } from 'theme';

let styles = {};

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.handleRetrievePet = this.handleRetrievePet.bind(this);
    this.animate = this.animate.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.animatedIcon = new Animated.Value(0);

    this.state = {
      apiResponse: null,
      loading: true,
      modalVisible: false,
    }
  }

  componentDidMount() {
    this.handleRetrievePet();
    this.animate();
  }

  animate() {
    Animated.loop(
      Animated.timing(
        this.animatedIcon,
        {
          toValue: 1,
          duration: 1300,
          easing: Easing.linear,
        }
      )
    ).start();
  }

  handleRetrievePet() {
    API.get('Pets', '/items/pets').then(apiResponse => {
      return Promise.all(apiResponse.map(async (pet) => {
        // Make "key" work with paths like:
        // "private/us-east-1:7817b8c7-2a90-4735-90d4-9356d7f8f0c7/091357f0-f0bc-11e7-a6a2-937d1d45b80e.jpeg"
        // and
        // "44b223e0-9707-11e7-a7d2-cdc5b84df56b.jpeg"
        const [, , , key] = /(([^\/]+\/){2})?(.+)$/.exec(pet.picKey);

        const picUrl = pet.picKey && await Storage.get(key, { level: 'private' });

        return { ...pet, picUrl };
      }));
    }).then(apiResponse => {
      this.setState({ apiResponse, loading: false });
    }).catch(e => {
      this.setState({ apiResponse: e.message, loading: false });
    });
  }

  openDrawer = () => {
    this.props.navigation.navigate('DrawerOpen');
  }

  toggleModal() {
    if (!this.state.modalVisible) {
      this.handleRetrievePet();
      this.animate();
    }

    this.setState((state) => ({ modalVisible: !state.modalVisible }));
  }

  renderPet(pet, index) {
    const uri = pet.picUrl;

    return (
      <TouchableHighlight
        onPress={() => {
          this.props.navigation.navigate('ViewPet', { pet })
        }}
        underlayColor='transparent'
        key={pet.petId}
      >
        <View style={styles.petInfoContainer}>
          <Image
            resizeMode='cover'
            source={uri ? { uri } : require('../../assets/images/profileicon.png')}
            style={styles.petInfoAvatar}
          />
          <Text style={styles.petInfoName}>{pet.name}</Text>
        </View>
      </TouchableHighlight>
    )
  }

  render() {
    const { loading, apiResponse } = this.state;
    const spin = this.animatedIcon.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const AddPetRoutes = StackNavigator({
      AddPet: { screen: AddPet },
      UploadPhoto: { screen: UploadPhoto },
    });

    return (
      <View style={[{ flex: 1 }]}>
        {!loading && <View style={{ position: 'absolute', bottom: 25, right: 25, zIndex: 1 }}>
          <Icon
            onPress={this.toggleModal}
            raised
            reverse
            name='add'
            size={44}
            containerStyle={{ width: 50, height: 50 }}
            color={colors.primary}
          />
        </View>}
        <ScrollView style={[{ flex: 1, zIndex: 0 }]} contentContainerStyle={[loading && { justifyContent: 'center', alignItems: 'center' }]}>
          {loading && <Animated.View style={{ transform: [{ rotate: spin }] }}><Icon name='autorenew' color={colors.grayIcon} /></Animated.View>}
          {
            !loading &&
            <View style={styles.container}>
              <Text style={styles.title}>My Pets</Text>
              {
                typeof apiResponse === 'string' ?
                  <Text>{apiResponse}</Text> :
                  apiResponse.map((pet, index) => this.renderPet(pet, index))
              }
            </View>
          }
        </ScrollView>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={this.toggleModal}
        >
          <AddPetRoutes screenProps={{ handleRetrievePet: this.handleRetrievePet, toggleModal: this.toggleModal }} />
        </Modal>
      </View >
    );
  }
};

styles = StyleSheet.create({
  container: {
    padding: 25,
  },
  title: {
    color: colors.darkGray,
    fontSize: 18,
    marginBottom: 15,
  },
  petInfoContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  petInfoName: {
    color: colors.darkGray,
    fontSize: 20,
    marginLeft: 17
  },
  petInfoAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  }
})



const HomeRouteStack = {
  Home: {
    screen: (props) => {
      const { screenProps, ...otherProps } = props;
      return <Home {...props.screenProps} {...otherProps} />
    },
    navigationOptions: (props) => {
      return {
        title: 'Home',
        headerLeft: <SideMenuIcon onPress={() => props.screenProps.rootNavigator.navigate('DrawerOpen')} />,
      }
    }
  },
  ViewPet: { screen: ViewPet }
};

const HomeNav = StackNavigator(HomeRouteStack);

export default (props) => {
  const { screenProps, rootNavigator, ...otherProps } = props;

  return <HomeNav screenProps={{ rootNavigator, ...screenProps, ...otherProps }} />
};
