import React, {useCallback, useEffect, useRef} from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';

import {images, scale, theme} from '../../Utils';
import {useState} from 'react';

const VideoComponent = (props) => {
  const {source, style, poster} = props;
  const videoRef = useRef(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [seekValue, setSeekValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [duration, setDuration] = useState(0.0);

  useEffect(() => {
    // Start buffering the video as soon as the component is mounted
    bufferVideo();
  }, []);

  const bufferVideo = async () => {
    try {
      setIsBuffering(true);
      await videoRef.current?.seek(0, 5000); // Seek to the start of the video with a tolerance of 5 seconds
    } catch (error) {
      setIsBuffering(false);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderValueChange = (value) => {
    videoRef.current?.seek(value, 5000);
  };

  const handleSliderSlidingComplete = (value) => {
    setCurrentTime(value);
  };

  const onHandleLoad = (data) => {
    videoRef.current?.seek(0, 5000);
    setDuration(data.duration);
    setIsBuffering(false);
  };

  const onReadyForDisplay = () => {
    setIsBuffering(false);
  };

  const handleVideoEnd = useCallback(() => {
    videoRef.current?.seek(0, 5000);
    setTimeout(() => {
      setIsBuffering(true);
      setIsPlaying(true);
    }, 100);
  }, []);

  const handleProgress = (progress) => {
    if (currentTime === progress?.currentTime) {
      setIsBuffering(true);
    } else {
      setIsBuffering(false);
    }
    setCurrentTime(progress?.currentTime);
    setSeekValue(progress?.currentTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  const onVideoBuffer = (param) => {
    setIsBuffering(param.isBuffering);
  };

  const handleLoadError = (error) => {
    console.log('Handle Load Error ==>> >' + error);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePlayPause}
      style={Styles.container}>
      <Video
        ref={videoRef}
        source={source}
        style={style}
        onLoad={onHandleLoad}
        paused={isPlaying}
        onBuffer={onVideoBuffer}
        onProgress={handleProgress}
        onReadyForDisplay={onReadyForDisplay}
        playWhenInactive={false}
        playInBackground={false}
        onEnd={handleVideoEnd}
        resizeMode="cover"
        posterResizeMode="cover"
        ignoreSilentSwitch="ignore"
        poster={poster}
        rate={1.0}
        progressUpdateInterval={50}
        onError={handleLoadError}
      />
      <View style={Styles.footer}>
        <Text style={Styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={Styles.seekBar}
          minimumValue={0}
          maximumValue={duration}
          thumbImage={Platform.OS === 'android' ? null : images.dot}
          thumbTintColor={theme.colors.green}
          minimumTrackTintColor={theme.colors.green}
          maximumTrackTintColor={theme.colors.grey}
          value={seekValue}
          onValueChange={handleSliderValueChange}
          onSlidingComplete={handleSliderSlidingComplete}
        />
        <Text style={Styles.timeText}>{formatTime(duration)}</Text>
      </View>
      {isBuffering && !isPlaying ? (
        <View style={Styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            animating={isBuffering}
            color={theme.colors.yellow}
          />
        </View>
      ) : (
        <View style={Styles.pauseButton}>
          <Icon
            name={!isPlaying ? 'pause-circle' : 'play-circle'}
            color={theme.colors.white}
            size={scale(50)}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};
export default VideoComponent;

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.SCREENWIDTH * 0.95,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: scale(50),
    paddingHorizontal: scale(14),
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseButton: {
    position: 'absolute',
    opacity: 0.4,
  },
  seekBar: {
    flex: 1,
    height: scale(40),
    marginHorizontal: scale(10),
  },
  timeText: {
    fontSize: scale(12),
    color: theme.colors.white,
    fontFamily: theme.fonts.rubicMedium,
  },
});
