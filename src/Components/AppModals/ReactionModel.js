import React from 'react';
import {StyleSheet, View, TouchableOpacity} from 'react-native';
import {scale, theme} from '../../Utils';
import FastImage from 'react-native-fast-image';

const ReactionModel = (props) => {
  const {indicatorOffsetForLike, likOption, onPressLikeEmoji} = props;
  return (
    <View
      style={[
        styles.mainContainer,
        {
          paddingBottom: scale(15),
          top:
            indicatorOffsetForLike > 500
              ? indicatorOffsetForLike - scale(50)
              : indicatorOffsetForLike - scale(55),
        },
      ]}>
      {likOption.map((i, index) => {
        return (
          <TouchableOpacity
            key={index.toString()}
            style={styles.row}
            onPress={() => {
              onPressLikeEmoji(index);
            }}>
            <FastImage
              source={i.icon}
              style={{width: scale(30), height: scale(30)}}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    backgroundColor: theme.colors.white,
    left: scale(20),
    borderRadius: scale(13),
    paddingVertical: scale(15),
    paddingHorizontal: scale(15),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.2,
    elevation: 1,
    flexDirection: 'row',
  },
  row: {
    margin: scale(3),
  },
});

export default ReactionModel;
