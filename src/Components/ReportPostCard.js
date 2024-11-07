/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import {scale, theme} from '../Utils';
import externalStyle from '../Css';
import {Label} from './index';
import {Button} from './Button';
import {getLocalText} from '../Locales/I18n';
import {REPORTSTATUS} from '../Utils/StaticData';

const ReportPostCard = props => {
  const {item, onPress, index, type} = props;
  return (
    <View style={[externalStyle.shadow, styles.container]}>
      <View style={styles.userCon}>
        <FastImage
          source={{uri: item?.blocked_user_pic?.original}}
          style={styles.userImage}
        />
        <View style={styles.namecon}>
          <Label title={item?.blocked_user_name} />
          <Text style={styles.text}>{item?.time}</Text>
        </View>
      </View>
      {item?.post ? <Label title={item?.post} style={styles.desc} /> : null}

      <View style={styles.devider}>
        {type !== 'post' ? (
          <View style={styles.row1}>
            <FastImage
              source={{uri: item?.reported_user_pic?.optimize}}
              style={styles.replyuserImg}
            />
            <Label title={item?.reported_user_name} />
          </View>
        ) : null}
      </View>
      <View
        style={[
          styles.btnRow,
          {flexDirection: type !== 'post' ? 'row' : 'row-reverse'},
        ]}>
        <Button
          onPress={() => {
            onPress(
              item,
              index,
              type !== 'post' ? REPORTSTATUS.ACCEPTED : REPORTSTATUS.DECLINED,
              type,
            );
          }}
          title={getLocalText(
            type !== 'post' ? 'Post.banuser' : 'Post.decpost',
          )}
          style={[
            styles.btn,
            {
              backgroundColor: type ? theme.colors.red : theme.colors.blue,
            },
          ]}
        />
        <Button
          onPress={() => {
            onPress(
              item,
              index,
              type !== 'post' ? REPORTSTATUS.DECLINED : REPORTSTATUS.ACCEPTED,
              type,
            );
          }}
          title={getLocalText(
            type !== 'post' ? 'Post.archive' : 'Post.acceptpost',
          )}
          style={{
            ...styles.btn,
            backgroundColor: type ? theme.colors.blue : theme.colors.red,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginVertical: scale(5),
    borderRadius: scale(18),
    padding: scale(13),
  },
  userImage: {
    height: scale(40),
    width: scale(40),
    resizeMode: 'contain',
    borderRadius: scale(20),
  },
  replyuserImg: {
    height: scale(20),
    width: scale(20),
    resizeMode: 'contain',
    borderRadius: scale(10),
    marginHorizontal: scale(10),
  },
  userCon: {
    flexDirection: 'row',
  },
  namecon: {
    left: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    color: theme.colors.grey10,
  },
  btnRow: {
    overflow: 'hidden',
    width: '100%',
    justifyContent: 'space-between',
  },
  btn: {
    width: '48%',
    borderRadius: scale(40),
    marginTop: scale(29),
    marginBottom: scale(0),
    height: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
  },
  devider: {
    marginTop: scale(25),
    width: '98%',
    borderBottomWidth: 0.5,
    opacity: 1,
    borderBottomColor: theme.colors.black1,
  },
  desc: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    marginTop: scale(3),
    left: scale(5),
    color: theme.colors.black,
  },
  row: {flexDirection: 'row', justifyContent: 'space-around'},
  row1: {flexDirection: 'row', marginBottom: scale(10)},
});

export default ReportPostCard;
