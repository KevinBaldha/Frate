import React from 'react';
import PropTypes from 'prop-types';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image';

const styles = StyleSheet.create({
  emojiTouch: {
    paddingVertical: 5,
    height: 40,
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  emojiImg: {
    alignSelf: 'center',
    resizeMode: 'cover',
  },
});

const EmojiIcon = ({
  emoji,
  clickEmoji,
  longPressEmoji,
  emojiWidth,
  emojiSize,
}) => {
  const {code, img} = emoji;
  return (
    <TouchableOpacity
      style={[styles.emojiTouch, {width: emojiWidth}]}
      onLongPress={() => (longPressEmoji ? longPressEmoji(emoji) : null)}
      onPress={() => clickEmoji(emoji)}>
      {code ? (
        <Text style={[styles.emoji, {fontSize: emojiSize}]}>{code}</Text>
      ) : (
        <FastImage
          source={{uri: img}}
          style={[styles.emojiImg, {width: emojiSize, height: emojiSize}]}
        />
      )}
    </TouchableOpacity>
  );
};

EmojiIcon.propTypes = {
  emoji: PropTypes.object,
  clickEmoji: PropTypes.func,
  longPressEmoji: PropTypes.func,
  emojiWidth: PropTypes.number,
  emojiSize: PropTypes.number,
};
export default EmojiIcon;
