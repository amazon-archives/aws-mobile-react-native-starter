import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

import { colors } from 'theme';
import { Icon } from 'react-native-elements';

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    left: 10,
  },
});

const SideMenuIcon = ({ onPress }) => (
  <View style={styles.iconContainer}>
    <Icon underlayColor="transparent" onPress={onPress} name="menu" color={colors.grayIcon} />
  </View>
);

export default SideMenuIcon;
