import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Ionicons';
import {getLocalText} from '../Locales/I18n';
import {theme, scale} from '../Utils';

const PostOptions = (props) => {
  const {
    options,
    indicatorOffset,
    isSponsored,
    handleOptions,
    item,
    data,
    is_sponsoredHiden,
    showStatic,
    singleOption,
    userData,
    isFromSavePost,
  } = props;
  let isOwnPost = data?.user_id === userData?.id;
  const clickArea =
    theme.SCREENHEIGHT - indicatorOffset - (isFromSavePost ? 0 : 112); //112 for bottom Tab height,
  return (
    <View
      style={[
        styles.mainContainer,
        {
          top: isFromSavePost
            ? isOwnPost && clickArea < 86
              ? indicatorOffset - 92
              : clickArea < 40
              ? indicatorOffset - 46
              : indicatorOffset
            : isOwnPost && clickArea < 265
            ? indicatorOffset - 271
            : clickArea < 155
            ? indicatorOffset - 161
            : indicatorOffset, //112 for bottom Tab height,  161 is height of other users post modal(155 is adjustment) , 271 is own post modal height
          paddingTop: singleOption ? scale(5) : scale(15),
          borderRadius: singleOption ? scale(7) : scale(13),
        },
      ]}>
      {options.map((d, i) => {
        return (
          <TouchableOpacity
            key={i.toString()}
            style={[
              styles.button,
              !isOwnPost && d.name === getLocalText('Post.reshare')
                ? {height: scale(0)}
                : {},
              {
                paddingVertical:
                  !isOwnPost &&
                  (d.name === getLocalText('Timeline.delete') ||
                    d.name === getLocalText('Post.reshare'))
                    ? scale(0)
                    : scale(6),
              },
            ]}
            onPress={() => handleOptions(i, item, data)}>
            {d.icon === 'bookmark' ? (
              <Icon1
                name={data.is_save ? 'bookmark' : 'bookmark-outline'}
                size={scale(18)}
                color={theme.colors.blue}
              />
            ) : isOwnPost && d.name === getLocalText('Timeline.delete') ? (
              <Icon name={d.icon} size={scale(18)} color={theme.colors.blue} />
            ) : d.name === getLocalText('Timeline.delete') ? null : isOwnPost &&
              d.name === getLocalText('Post.reshare') ? (
              <Icon name={d.icon} size={scale(18)} color={theme.colors.blue} />
            ) : d.name === getLocalText('Post.reshare') ||
              (isSponsored !== 1 &&
                d.name === getLocalText('Timeline.seestatic')) ? (
              isOwnPost && (
                <Icon
                  name={d.icon}
                  size={scale(18)}
                  color={theme.colors.blue}
                />
              )
            ) : (
              <Icon name={d.icon} size={scale(18)} color={theme.colors.blue} />
            )}

            {d.name === getLocalText('Timeline.save') ? (
              <Text style={styles.text}>
                {data.is_save ? getLocalText('Post.saved') : d.name}
              </Text>
            ) : d.name === getLocalText('Timeline.suspendnotification') ? (
              <Text style={styles.text}>
                {data.is_notification_blocked
                  ? getLocalText('Timeline.suspendunnotification')
                  : d.name}
              </Text>
            ) : d.name === getLocalText('Post.reshare') ? (
              <Text style={styles.text}>
                {isOwnPost
                  ? data?.is_reshared
                    ? getLocalText('Post.direshare')
                    : d.name
                  : null}
              </Text>
            ) : isOwnPost && d.name === getLocalText('Timeline.delete') ? (
              <Text style={styles.text}>{d.name}</Text>
            ) : d.name === getLocalText('Timeline.delete') ||
              (isSponsored !== 1 &&
                d.name === getLocalText('Timeline.seestatic')) ? (
              isOwnPost && <Text style={styles.text}>{d.name}</Text>
            ) : (
              <Text style={styles.text}>{d.name}</Text>
            )}
          </TouchableOpacity>
        );
      })}
      {is_sponsoredHiden || isSponsored === 1 || showStatic ? null : (
        <TouchableOpacity
          style={[
            styles.sponsorView,
            {
              borderBottomEndRadius: isOwnPost ? scale(0) : scale(13),
              borderBottomLeftRadius: isOwnPost ? scale(0) : scale(13),
            },
          ]}
          onPress={() => handleOptions(-1, item, data)}>
          <Icon
            name={'trending-up'}
            size={scale(18)}
            color={theme.colors.white3}
          />
          <Text style={[styles.text, {color: theme.colors.white3}]}>
            {getLocalText('Timeline.sponsor')}
          </Text>
        </TouchableOpacity>
      )}

      {(isSponsored === 1 || showStatic || isOwnPost) && (
        <>
          {isSponsored === 1 ? <View style={styles.devider} /> : null}
          <TouchableOpacity
            style={[styles.staticView]}
            onPress={() => handleOptions(-2, item, data)}>
            <Icon
              name={'trending-up'}
              size={scale(18)}
              color={theme.colors.blue}
            />
            <Text style={styles.text}>
              {getLocalText('Timeline.seestatic')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    position: 'absolute',
    backgroundColor: theme.colors.white,
    right: scale(18),
    top: scale(50),
    borderRadius: scale(13),
    width: theme.SCREENWIDTH / 1.6,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.2,
    elevation: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(6),
    marginHorizontal: scale(20),
  },
  text: {
    marginLeft: scale(11),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
  },
  sponsorView: {
    backgroundColor: theme.colors.blue,
    paddingVertical: scale(9),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomEndRadius: scale(13),
    borderBottomLeftRadius: scale(13),
  },
  devider: {
    width: '80%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.black,
    marginTop: scale(1),
  },
  staticView: {
    backgroundColor: theme.colors.white,
    paddingVertical: scale(9),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomEndRadius: scale(13),
    borderBottomLeftRadius: scale(13),
  },
});

export default PostOptions;
