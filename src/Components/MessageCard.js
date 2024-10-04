/* eslint-disable no-unused-vars */
import React from 'react';
import {View, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import moment from 'moment';
import {scale, theme, images} from '../Utils';
import externalStyle from '../Css';
import {GroupImages, Label, Button} from './index';
import {getLocalText} from '../Locales/I18n';

const MessageCard = (props) => {
  const {item, onPress, index, chat} = props;
  let day = moment(item?.created_at);
  return (
    <View style={[externalStyle.shadow, styles.container]}>
      <View style={styles.userCon}>
        <FastImage
          source={
            item?.member_image === undefined
              ? images.groupDefault
              : {uri: item?.member_image}
          }
          style={styles.userImage}
        />
        <View style={styles.namecon}>
          <Label title={item?.room_title} />
          {/* <Text style={styles.text}>{time}</Text> */}
        </View>
      </View>
      {item?.desc ? <Label title={item?.desc} style={styles.desc} /> : null}
      <GroupImages
        groupImagesView={{left: scale(5), marginVertical: scale(10)}}
        members={item}
        time={day}
      />
      <Button
        onPress={onPress}
        title={
          chat
            ? getLocalText('Group.messagebtn')
            : getLocalText('Group.joinbtn')
        }
        style={styles.btn}
        titleStyle={{color: theme.colors.blue}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginVertical: scale(5),
    borderRadius: scale(18),
    padding: scale(13),
    marginHorizontal: scale(18),
  },
  userImage: {
    height: scale(40),
    width: scale(40),
    resizeMode: 'contain',
    borderRadius: scale(20),
  },
  userCon: {
    flexDirection: 'row',
  },
  namecon: {
    left: scale(10),
  },
  text: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    color: theme.colors.grey10,
  },
  btn: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: 1,
    borderRadius: scale(10),
    marginTop: scale(15),
    marginBottom: scale(0),
  },
  desc: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    marginTop: scale(3),
    left: scale(5),
  },
});

export default MessageCard;
