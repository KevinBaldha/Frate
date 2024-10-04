import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import ImageZoom from 'react-native-image-pan-zoom';
import {scale, theme, height} from '../../Utils';
import externalStyle from '../../Css';
import {ChatVideoShow} from '../index';

const FullMediaModel = (props) => {
  const {isShow, closeModel, postImages, index} = props;
  const [isPaused, setIsPaused] = useState(true);
  const scrollViewRef = React.useRef();
  const toggleVideoButton = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Modal
      isVisible={isShow}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={styles.container}
      onBackdropPress={() => closeModel()}
      backdropOpacity={1}
      backdropColor={theme.colors.white}>
      <View
        key={index}
        style={[
          externalStyle.shadow,
          styles.headerCon,
          {shadowRadius: scale(3)},
        ]}>
        <View style={styles.height50}>
          <TouchableOpacity
            onPress={() => closeModel()}
            style={styles.iconClose}>
            <Icon
              name="arrow-left"
              size={scale(25)}
              color={theme.colors.blue}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.contentStyle}
          style={styles.scrollCon}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          pagingEnabled
          bounces={false}
          ref={scrollViewRef}>
          <View style={styles.subContainer}>
            {postImages?.mediaType?.toLowerCase() === 'image' ? (
              <ImageZoom
                cropWidth={theme.SCREENWIDTH}
                cropHeight={'100%'}
                imageWidth={theme.SCREENWIDTH}
                imageHeight={'100%'}
                onSwipeDown={() => {
                  closeModel();
                }}>
                <FastImage
                  style={styles.imageCon}
                  source={
                    postImages.image || {
                      uri: postImages.uri?.original || postImages.uri,
                    }
                  }
                  resizeMode={FastImage.resizeMode.contain}
                />
              </ImageZoom>
            ) : postImages.mediaType === 'video' ? (
              <View style={styles.videoView}>
                <ChatVideoShow
                  url={postImages.url || postImages.uri}
                  thumbnail={postImages?.thumbnail}
                  isPaused={isPaused}
                  handleMuteVideo={toggleVideoButton}
                  endVideo={toggleVideoButton}
                  resizeMode="contain"
                  fullScreen={true}
                  style={styles.videoContainer}
                  moveVolume={(data) => {}}
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
        <View style={styles.height50} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    marginTop: isIphoneX() ? scale(20) : scale(0),
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  headerCon: {
    marginTop: Platform.OS === 'ios' ? scale(25) : scale(25),
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
  },
  scrollCon: {
    backgroundColor: theme.colors.white,
  },
  imageCon: {
    width: theme.SCREENWIDTH,
    alignSelf: 'center',
    height: theme.SCREENHEIGHT * 0.8,
    resizeMode: 'stretch',
  },
  iconClose: {
    position: 'absolute',
    padding: 7,
    zIndex: 11,
    top: Platform.OS === 'ios' ? theme.SCREENHEIGHT * 0.05 : 0,
    marginLeft: scale(5),
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '90%',
  },
  videoView: {
    backgroundColor: theme.colors.black,
    width: '100%',
    height: '95%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  height50: {
    height: theme.SCREENHEIGHT * 0.1,
  },
  contentStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FullMediaModel;
