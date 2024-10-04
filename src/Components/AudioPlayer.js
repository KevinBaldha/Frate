/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect} from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import Icon1 from 'react-native-vector-icons/SimpleLineIcons';
import useSound from 'react-native-use-sound';
import {getDuration, scale, theme} from '../Utils';

const AudioPlayer = (props) => {
  const {url} = props;
  const [duration, setDuration] = React.useState(0);
  const [value, setvalue] = React.useState(0);
  const coolMusic = url?.uri || url;
  const [play, pause, stop, data] = useSound(coolMusic);

  const time = getDuration(value);
  useEffect(() => {
    if (!data.isPlaying || data.currentTime === 0) {
      setvalue(0);
    } else setvalue(data.currentTime);
    const total_len = getDuration(data.duration);
    setDuration(total_len);
  }, [data.currentTime]);

  const handlePlay = () => {
    setvalue(data.currentTime);
    const total_len = getDuration(data.duration);
    setDuration(total_len);

    if (data.isPlaying) pause();
    else play();
  };
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        handlePlay();
      }}>
      <Icon1 name={'earphones'} size={scale(15)} color={theme.colors.white} />
      <Text style={styles.txt}>
        {time === '0:00' ? getDuration(data.duration) : time}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.blue,
  },
  txt: {
    position: 'absolute',
    bottom: scale(5),
    left: scale(10),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(10),
    color: theme.colors.white,
  },
});

export default AudioPlayer;
