import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {theme} from '../Utils';

const ScreenContainer = (props) => {
  const {children, style} = props;
  return (
    <View style={styles.container}>
      <StatusBar barStyle={'default'} />
      <View style={[styles.mainContainer, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.white1,
  },
});

export default ScreenContainer;
