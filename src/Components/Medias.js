import React from 'react';
import {StyleSheet} from 'react-native';
import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Bar';
import {AudioPlayer, VideoShow} from './index';
import {scale} from '../Utils';

const Medias = (props) => {
  const {item} = props;
  const [isPaused, setisPaused] = React.useState(true);
  const [audio, setAudio] = React.useState(true);

  const toggleAudio = () => {
    setAudio(!audio);
  };

  const renderItem = () => {
    if (
      item?.message_type === 'Image' ||
      item?.media_type === 'image' ||
      item?.type === 'image'
    ) {
      return (
        <Image
          source={{
            uri: item?.attachment ? item?.attachment : item?.uri?.medium,
          }}
          style={styles.image}
          indicator={ProgressBar}
          indicatorProps={{
            width: scale(80),
          }}
        />
      );
    } else if (
      item?.message_type === 'Video' ||
      item?.media_type === 'video' ||
      item?.type === 'Video'
    ) {
      return (
        <VideoShow
          videoStyle={styles.videoView}
          isPaused={isPaused}
          groupInfo={true}
          url={item?.attachment || item?.uri?.optimize}
          thumbnail={item?.video_thumb || item?.thumbnail}
        />
      );
    } else if (item?.message_type === 'Audio') {
      return (
        <AudioPlayer
          url={item?.attachment || item?.audio}
          index={item?.id}
          toggleAudio={toggleAudio}
          isPaused={audio}
        />
      );
    }
  };

  return <>{renderItem()}</>;
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
});

export default Medias;
