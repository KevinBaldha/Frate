// API SETUP
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {scale} from './responsive';
import theme from './theme';

//API Token
export const API_TOKEN = '';

export const NO_DATA_COMPO = (
  loading = false,
  msg = msg === undefined ? '' : msg,
) => {
  if (loading) {
    return null;
  } else {
    return (
      <View style={styles.loadingView}>
        <Text
          style={{
            color: theme.colors.blue,
            fontSize: scale(20),
            fontFamily: theme.fonts.muktaMedium,
          }}>
          {msg}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
});
