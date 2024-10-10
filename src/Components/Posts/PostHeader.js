import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {scale, theme} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {getWeekDay} from '../../Utils/helper';

const PostHeader = props => {
  const {
    handleOptions,
    item,
    index,
    showOption,
    optionsIconColor,
    postId,
    onPressGroup,
    onPressProfile,
    onPressSponsor,
    onPressSharePost,
  } = props;
  return (
    <>
      {item?.shared_by != null && (
        <View style={styles.reshareCon}>
          <Text style={styles.resharetxt}>
            {getLocalText('Post.sharedBy') + '  '}
            <Text
              onPress={() => {
                onPressSharePost(item?.shared_by_id);
              }}
              style={styles.reshare}>
              {item?.shared_by}
            </Text>
          </Text>
        </View>
      )}
      <View style={[styles.postTopContainer]}>
        <TouchableOpacity onPress={() => onPressProfile(item, index)}>
          <FastImage
            style={styles.userImage}
            source={{uri: item?.user_pic?.optimize}}
          />
        </TouchableOpacity>
        <View style={styles.viewname}>
          <Text style={styles.usertxt}>
            {item?.first_name + ' ' + item?.last_name}
            {item?.admins && item?.user_id === item?.admins[0] && (
              <Text style={[styles.usertxt, {fontWeight: 'bold'}]}>
                {' Admin'}
              </Text>
            )}
          </Text>
          <View style={styles.daytimecon}>
            <TouchableOpacity onPress={() => onPressGroup(item, index)}>
              <Text style={styles.group}>{item?.group?.name}</Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.day,
                !item?.day ? {left: scale(-2)} : {},
                {
                  color: theme.colors.grey2,
                },
              ]}>
              {item?.time === undefined ? null : '  | '}
              {`${getWeekDay(moment(item?.time).format('ddd'))} ${moment(
                item?.time,
              ).format('hh:mm')}`}
            </Text>
          </View>
        </View>
        {item?.is_sponsored ? (
          <View style={styles.sponsoredView} onPress={onPressSponsor}>
            <Text style={styles.sponsored}>
              {getLocalText('Timeline.sponsored').toUpperCase()}
            </Text>
          </View>
        ) : null}
        {showOption ? (
          <TouchableOpacity
            style={styles.verticleView}
            onPress={evt => handleOptions(evt, item)}>
            <Icon
              name="more-vertical"
              color={
                postId === item?.id
                  ? optionsIconColor
                    ? theme.colors.blue
                    : theme.colors.darkGrey
                  : theme.colors.darkGrey
              }
              size={scale(19)}
            />
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>
    </>
  );
};

export default PostHeader;

const styles = StyleSheet.create({
  postTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewname: {
    width: '75%',
  },
  userImage: {
    height: scale(40),
    width: scale(40),
    borderRadius: scale(20),
  },
  usertxt: {
    fontSize: scale(15),
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey2,
  },
  day: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    color: theme.colors.blue1,
  },
  group: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    color: theme.colors.blue1,
    textDecorationLine: 'underline',
  },
  daytimecon: {
    flexDirection: 'row',
    marginTop: scale(-5),
  },
  sponsoredView: {
    position: 'absolute',
    top: -scale(10),
    right: scale(30),
    backgroundColor: theme.colors.blue,
    paddingHorizontal: scale(7),
    paddingVertical: scale(4),
    borderBottomLeftRadius: scale(8),
    borderBottomEndRadius: scale(8),
  },
  sponsored: {
    color: theme.colors.white2,
    fontSize: scale(9),
    fontFamily: theme.fonts.muktaBold,
  },
  reshareCon: {
    paddingBottom: scale(5),
    borderBottomColor: theme.colors.grey4,
    borderBottomWidth: scale(0.3),
    marginBottom: scale(8),
  },
  resharetxt: {
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.grey10,
    fontSize: scale(13),
    marginLeft: scale(5),
  },
  reshare: {
    textDecorationLine: 'underline',
    color: theme.colors.blue,
    marginLeft: scale(5),
  },
  verticleView: {
    width: scale(20),
    height: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
