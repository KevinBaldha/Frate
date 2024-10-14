import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Icon1 from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/Feather';
import convertToProxyURL from 'react-native-video-cache';
import FastImage from 'react-native-fast-image';
import {scale, theme, getDuration} from '../Utils';
import VideoComponents from './VideoComponent';

const VideoShow = (props) => {
  const {url, style, groupInfo, fullScreen, chat, thumbnail} = props;
  const duration = 0;

  return (
    <View style={[styles.container, style]}>
      {fullScreen ? (
        <VideoComponents
          source={
            url.video?.original ||
            url.video?.uri || {
              uri: convertToProxyURL?.(
                url?.optimize !== undefined ? url?.optimize : url?.original,
              ),
            }
          }
          style={styles.videoContainer}
        />
      ) : (
        <View style={[styles.container, styles.video]}>
          <FastImage style={styles.video} source={{uri: thumbnail}} />
          <Icon1
            name={'play'}
            size={scale(45)}
            color={theme.colors.white}
            style={styles.position}
          />
        </View>
      )}
      {groupInfo || chat !== undefined ? (
        <View style={styles.iconCon}>
          <Icon
            name={'video'}
            size={scale(13)}
            color={theme.colors.white}
            style={{top: scale(1)}}
          />
          <Text style={styles.txt}>{duration && getDuration(duration)}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: theme.SCREENWIDTH * 0.95,
    height: '100%',
    margin: 10,
  },
  video: {width: '100%', height: '100%'},
  position: {
    position: 'absolute',
  },
  button: {position: 'absolute'},
  iconCon: {
    position: 'absolute',
    bottom: scale(5),
    left: scale(5),
    flexDirection: 'row',
  },
  txt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(10),
    color: theme.colors.white,
    alignItems: 'center',
    left: scale(5),
  },
});
export default VideoShow;
