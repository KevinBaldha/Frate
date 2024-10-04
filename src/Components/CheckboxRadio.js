import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {theme, scale} from '../Utils';

const RadioButton = (props) => {
  const {selectedIndex, index} = props;
  return (
    <View
      style={[
        styles.radioView,
        {
          borderColor:
            selectedIndex === index ? theme.colors.blue : theme.colors.grey,
        },
      ]}>
      {selectedIndex === index ? <View style={[styles.checked]} /> : null}
    </View>
  );
};

const CheckBox = (props) => {
  const {isChecked} = props;
  return (
    <View
      style={[
        styles.radioView,
        {
          borderRadius: scale(0),
          borderColor: isChecked ? theme.colors.blue : theme.colors.grey,
        },
      ]}>
      {isChecked ? (
        <Icon name="check" color={theme.colors.blue} size={scale(20)} />
      ) : null}
    </View>
  );
};

export {RadioButton, CheckBox};

const styles = StyleSheet.create({
  radioView: {
    borderWidth: 1,
    borderColor: theme.colors.grey,
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: scale(13),
    height: scale(13),
    borderRadius: scale(7),
    backgroundColor: theme.colors.blue,
  },
});
