import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {theme, scale} from '../Utils';

const Label = (props) => {
  const {title, style, numberOfLines} = props;
  return (
    <Text style={[styles.text, style]} numberOfLines={numberOfLines}>
      {title}
    </Text>
  );
};

const Title = (props) => {
  const {title, style} = props;
  return <Text style={[styles.title, style]}>{title}</Text>;
};

const Error = (props) => {
  const {error, style} = props;
  return <Text style={[styles.error, style]}>{error}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: scale(14),
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey2,
  },
  title: {
    color: theme.colors.blue,
    fontSize: scale(18),
    fontFamily: theme.fonts.rubicMedium,
  },
  error: {
    textAlign: 'center',
    color: theme.colors.red1,
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
  },
});

export {Label, Title, Error};
