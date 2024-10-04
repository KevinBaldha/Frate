import React from 'react';
import {View, Text, StyleSheet, Linking} from 'react-native';
import FastImage from 'react-native-fast-image';
import {scale, theme} from '../Utils';
import externalStyle from '../Css';
import {Label} from './index';

const Links = (props) => {
  const {item} = props;
  return (
    <View style={styles.messageCard}>
      <View
        style={[
          styles.msgBlock,
          externalStyle.shadow,
          {shadowRadius: scale(5)},
        ]}>
        <View style={styles.msgHeader}>
          <View style={styles.userImgCon}>
            <FastImage source={item?.userImage} style={styles.userPic} />
            <View style={[styles.alphabetView, externalStyle.shadow]}>
              <Text style={[styles.receiveText, {color: item?.color}]}>
                {item?.name.slice(0, 1)}
              </Text>
            </View>
          </View>
          <Label
            title={item?.name}
            style={{
              color: item?.color,
              marginLeft: scale(13),
            }}
          />
        </View>
        <Text style={[styles.msgTxt]}>
          {item?.msg}
          <Text
            onPress={() => {
              Linking.openURL(item?.link).catch(() => {});
            }}
            style={[styles.msgTxt, styles.link]}>
            {item?.link}
          </Text>
        </Text>
        <Label title={'9:55 PM'} style={styles.time} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageCard: {
    marginVertical: scale(5),
  },
  msgBlock: {
    width: '100%',
    borderRadius: scale(12),
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
  },
  msgTxt: {
    color: theme.colors.black,
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
  },
  time: {
    alignSelf: 'flex-end',
    color: theme.colors.grey6,
    fontSize: scale(11),
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  userImgCon: {
    borderColor: theme.colors.grey10,
    borderWidth: 2,
    padding: scale(1),
    borderRadius: scale(17),
  },
  userPic: {
    height: scale(30),
    width: scale(30),
    resizeMode: 'cover',
    borderRadius: scale(15),
  },
  alphabetView: {
    width: scale(18),
    height: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: scale(9),
    backgroundColor: theme.colors.white,
    bottom: -scale(8),
    right: -scale(8),
  },
  receiveText: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  link: {
    color: theme.colors.blue,
    textDecorationLine: 'underline',
    marginTop: scale(3),
  },
});

export default Links;
