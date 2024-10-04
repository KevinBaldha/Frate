import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import convertToProxyURL from 'react-native-video-cache';
import VideoComponents from '../VideoComponent';

const ChatVideoShow = (props) => {
  const {url, thumbnail} = props;

  return (
    <VideoComponents
      source={{uri: convertToProxyURL(url)}}
      poster={
        Platform.OS === 'ios' ? null : thumbnail === undefined ? '' : thumbnail
      }
      style={styles.video}
    />
  );
};

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
  },
});
export default ChatVideoShow;
