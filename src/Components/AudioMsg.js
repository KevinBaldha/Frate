import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Foundation';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import {scale, theme, images, moderatedScale} from '../Utils';
import externalStyle from '../Css';
import {Label} from './index';

const AudioMsg = props => {
  const {
    url,
    item,
    style,
    iconColor,
    timeColor,
    chatid,
    audioindex,
    userReciverData,
    previousIndex,
    handlePreviousIndex,
    created_at,
  } = props;
  const {position, duration} = useProgress();

  // const [currentplay, setCurrentplay] = useState(null);
  const [loadAudio, setLoadAudio] = useState(false);
  const [play, setPlay] = useState(false);
  const [value, setvalue] = useState(0);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (position >= duration && duration > 0) {
      setPlay(true); // Set play to true when the audio reaches the end
    }
  }, [position, duration]);

  const init = async () => {
    await TrackPlayer.setupPlayer();
  };

  const handlePlay = async () => {
    if (play) {
      setLoadAudio(true);
    }

    await TrackPlayer.reset();
    var track1 = {
      url: url, // Load media from the network
      title: 'Avaritia',
      artist: 'deadmau5',
      album: 'while(1<2)',
      genre: 'Progressive House, Electro House',
      date: '2014-05-20T07:00:00+00:00', // RFC 3339
      artwork: 'http://example.com/cover.png', // Load artwork from the network
      duration: duration, // Duration in seconds
    };
    await TrackPlayer.add(track1);
    if (play) {
      await TrackPlayer.play();
      await TrackPlayer.setVolume(1);
      await TrackPlayer.getState();
    } else {
      await TrackPlayer.pause();
    }
    setLoadAudio(false);
  };

  const changeTime = async seconds => {
    const reminaTime = duration > 0 ? duration - seconds : 0;
    setvalue(reminaTime);
  };

  const onDropProgress = time => {
    TrackPlayer.seekTo(time);
  };

  const formatTime = audioDuration => {
    console.log('audioDuration ->', audioDuration);
    console.log('audioDuration ->', typeof audioDuration);

    // Ensure audioDuration is a number and not undefined
    if (typeof audioDuration !== 'number') {
      return '00 : 00'; // Default fallback if audioDuration is invalid
    }

    const time = item?.audio_duration?.split(':');

    // Ensure time is split properly and use fallback values for minutes and seconds
    const formattedMinutes = time?.[1] !== undefined ? time[1].padStart(2, '0') : '00';
    const formattedSeconds = time?.[2] !== undefined ? time[2].padStart(2, '0') : '00';

    // Display formatted time as MM : SS
    return `${formattedMinutes} : ${formattedSeconds}`;
  };

  const time = item?.audio_duration?.split(':');
  console.log('item?.audio_duration->', item?.audio_duration);
  console.log('audioindex->', audioindex);

  const sliderWidth = 100;

  const calculateStepSize = () => {
    return duration > 0 ? sliderWidth / duration : sliderWidth;
  };

  const stepSize = calculateStepSize();

  console.log('stepSize ->',stepSize);

  console.log('formatTime POSITION->', formatTime(position));
  console.log('formatTime DURATION->', formatTime(duration));

  return (
    <View
      style={[
        styles.container,
        externalStyle.shadow,
        style,
        {backgroundColor: iconColor ? theme.colors.blue : theme.colors.white},
      ]}>
      <View style={styles.view}>
        {chatid === '1' ? null : (
          <View style={styles.msgHeader}>
            <View style={styles.userImgCon}>
              <FastImage
                source={
                  item?.user_image?.length === 0
                    ? images.profilepick
                    : {
                        uri: item?.user_image?.original || item?.user_image,
                      }
                }
                style={styles.userPic}
              />
              <View style={[styles.alphabetView, externalStyle.shadow]}>
                <Text style={[styles.receiveText, {color: theme.colors.black}]}>
                  {item?.user_name.slice(0, 1)}
                </Text>
              </View>
            </View>

            <Label
              title={item?.user_name}
              style={{
                color: userReciverData?.color_hex
                  ? userReciverData?.color_hex
                  : iconColor
                  ? theme.colors.white
                  : theme.colors.black,
                marginLeft: scale(13),
              }}
            />
          </View>
        )}
      </View>
      <View style={styles.msgHeader1}>
        {loadAudio ? (
          <ActivityIndicator
            size={'small'}
            style={{paddingHorizontal: scale(20)}}
            color={iconColor ? theme.colors.white : theme.colors.blue}
          />
        ) : (
          <TouchableOpacity
            onPress={() => {
              handlePreviousIndex();
              setPlay(!play);
              handlePlay();
            }}
            style={{paddingLeft: scale(10)}}>
            <Icon
              name={play || audioindex !== previousIndex ? 'play' : 'pause'}
              size={scale(27)}
              color={iconColor ? theme.colors.white : theme.colors.blue}
              style={{paddingRight: scale(25)}}
            />
          </TouchableOpacity>
        )}
        <Slider
          minimumValue={0}
          maximumValue={duration}
          value={audioindex !== previousIndex ? 0 : position}
          style={[{width: sliderWidth}, styles.slider]}
          step={stepSize} // Adjust the step size based on duration
          // maximumValue={duration}
          // value={audioindex !== previousIndex ? 0 : position}
          // style={[{ width: sliderWidth }, styles.slider]}
          thumbTintColor={iconColor ? theme.colors.white : theme.colors.blue}
          maximumTrackTintColor={
            iconColor ? theme.colors.blueLine : theme.colors.grey22
          }
          minimumTrackTintColor={
            iconColor ? theme.colors.white : theme.colors.blue
          }
          thumbTouchSize={{width: 10, height: 10}}
          onSlidingComplete={data => {
            onDropProgress(data);
          }}
          onValueChange={seconds => {
            changeTime(seconds);
          }}
        />
      </View>

      <View style={styles.msgHeader2}>
        <Text
          style={[
            styles.txt,
            {color: iconColor ? theme.colors.white : theme.colors.grey6},
          ]}>
          {/* {time &&
            `${time[1] !== undefined ? time[1] : '00'} : ${
              time[2] !== undefined ? time[2] : '04'
            }`} */}
          {formatTime(position)}
        </Text>
        <Text
          style={[
            styles.time,
            {color: timeColor ? timeColor : theme.colors.grey1},
          ]}>
          {created_at}
        </Text>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  time: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(10),
    alignSelf: 'center',
    marginLeft: scale(20),
  },
  container: {
    width: theme.SCREENWIDTH * 0.62,
    borderRadius: scale(20),
    shadowColor: theme.colors.black,
    paddingVertical: scale(7),
    paddingHorizontal: scale(7),
    marginBottom: scale(5),
  },
  txt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(10),
    alignSelf: 'center',
    marginLeft: scale(20),
  },
  userPic: {
    height: scale(30),
    width: scale(30),
    resizeMode: 'cover',
    borderRadius: scale(15),
  },
  view: {
    flexDirection: 'row',
    marginTop: scale(5),
    alignItems: 'center',
  },
  slider: {
    padding: 0,
    marginLeft: -scale(10),
    marginTop: scale(-3),
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
    marginLeft: scale(5),
  },
  msgHeader1: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgHeader2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userImgCon: {
    borderColor: theme.colors.grey10,
    borderWidth: 2,
    padding: scale(1),
    borderRadius: scale(17),
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
});

export default AudioMsg;
