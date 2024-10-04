import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {VideoShow} from '../index';
import externalStyle from '../../Css';

const FullImageModel = (props) => {
  const {isShow, closeModel, postImages, index} = props;
  const [isPaused, setisPaused] = useState(true);
  const [disableScroll, setDisableScroll] = useState(false);
  const scrollViewRef = React.useRef();
  const ScrollImgs = () => {
    scrollViewRef.current.scrollTo({
      x: theme.SCREENWIDTH * index == null ? 0 : theme.SCREENWIDTH * index,
      animated: true,
    });
  };
  // ScrollImgs();
  index !== undefined && isShow
    ? setTimeout(() => {
        ScrollImgs();
      }, 0)
    : null;
  const toggleVideoButton = () => {
    setisPaused(!isPaused);
  };
  return (
    <Modal
      isVisible={isShow}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={styles.container}
      onBackdropPress={() => {
        closeModel();
      }}
      onBackButtonPress={() => {
        closeModel();
      }}
      coverScreen={true}
      backdropOpacity={0}>
      <View
        style={[
          externalStyle.shadow,
          styles.headerCon,
          {shadowRadius: scale(3)},
        ]}>
        <View style={{height: scale(50)}}>
          <TouchableOpacity
            onPress={() => {
              closeModel();
            }}
            style={styles.iconClose}>
            <Icon
              name="arrow-left"
              size={scale(25)}
              color={theme.colors.blue}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal={true}
          style={styles.scrollCon}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          pagingEnabled
          scrollEnabled={!disableScroll}
          ref={scrollViewRef}>
          {postImages === ''
            ? null
            : postImages?.map((data, i) => {
                return (
                  <View style={styles.subContainer} key={i}>
                    {data.media_type === 'image' ? (
                      <FastImage
                        style={styles.imageCon}
                        source={
                          data.image?.original
                            ? data.image
                            : {uri: data.uri?.original || data.url?.original}
                        }
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    ) : (
                      <VideoShow
                        thumbnail={data?.thumbnail}
                        url={data.uri}
                        videoStyle={{
                          width: theme.SCREENWIDTH,
                          height: theme.SCREENHEIGHT,
                          marginVartical: scale(20),
                        }}
                        isPaused={isPaused}
                        handleMuteVideo={toggleVideoButton}
                        endVideo={toggleVideoButton}
                        fullScreen={true}
                        // resizeMode="contain"
                        moveVolume={(datas) => {
                          setDisableScroll(datas);
                        }}
                      />
                    )}
                  </View>
                );
              })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    marginTop: isIphoneX() ? scale(25) : scale(5),
    flex: 1,
    alignSelf: 'center',
    margin: 0,
  },
  headerCon: {
    marginTop: Platform.OS === 'ios' ? scale(35) : scale(25),
    justifyContent: 'center',
  },
  scrollCon: {
    backgroundColor: theme.colors.white,
    paddingVertical: scale(5),
  },
  imageCon: {
    width: theme.SCREENWIDTH,
    alignSelf: 'center',
    height: theme.SCREENHEIGHT,
    resizeMode: 'contain',
  },
  iconClose: {
    position: 'absolute',
    padding: 7,
    zIndex: 11,
    marginLeft: scale(5),
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default FullImageModel;
