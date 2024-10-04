import React, {PureComponent} from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import Icon1 from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-simple-toast';
import Icon3 from 'react-native-vector-icons/Ionicons';
import {Stopwatch} from 'react-native-stopwatch-timer';
import {isIphoneX} from 'react-native-iphone-x-helper';
import FastImage from 'react-native-fast-image';
import VideoComponent from '../VideoComponent';
import {
  imageData,
  images,
  imagesOptions,
  scale,
  theme,
  height,
} from '../../Utils';
import {Label, GalleryModel} from '../index';
import {getLocalText} from '../../Locales/I18n';

export default class CameraModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      back: false,
      flash: false,
      timer: false,
      video: false,
      lastImage: '',
      attachImages: [],
      isPause: true,
      galleryVisible: false,
      selectedTime: 'off',
      timerData: [{type: 'off'}, {type: '5s'}, {type: '10s'}],
      videoRecodingStart: false,
      timerStart: false,
      timerReset: false,
    };
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      this.hasAndroidPermission();
    }

    this.getLastImage();
  }

  getLastImage = () => {
    CameraRoll.getPhotos({
      first: 1,
      assetType: 'Photos',
      groupTypes: 'All',
    })
      .then(r => {
        this.setState({lastImage: r.edges[0].node.image.uri});
        // setImages(r.edges);
      })
      .catch(() => {});
  };

  takeImage = () => {
    if (this.state.selectedTime === 'off') {
      this.handleCamera();
    } else if (this.state.selectedTime === '5s') {
      setTimeout(() => {
        this.handleCamera();
      }, 5000);
    } else {
      setTimeout(() => {
        this.handleCamera();
      }, 10000);
    }
  };
  handleCamera = async () => {
    const data = await this.camera.takePictureAsync(imagesOptions);
    const image = imageData(data.uri);
    this.setState({
      attachImages: [{uri: data.uri, type: 'image/jpeg', name: image.name}],
    });
  };
  takeVideo = async () => {
    Toast.show('Recording...', Toast.SHORT);
    this.setState({videoRecodingStart: true, timerStart: true});
    try {
      const data = await this.camera.recordAsync({mute: false, fps: 60});
      this.setState({
        attachImages: [
          ...this.state.attachImages,
          {
            video: {
              uri: data?.uri,
              name: data?.uri,
              type: 'video/mp4',
            },
          },
        ],
      });
    } catch (err) {}
  };

  takeVideoStop = async () => {
    // Toast.show('Video Recording end.', Toast.SHORT);
    this.setState({
      videoRecodingStart: false,
      timerStart: false,
      timerReset: true,
    });
    try {
      await this.camera.stopRecording();
    } catch (err) {}
  };

  handleTimer = d => {
    this.setState({selectedTime: d, timer: false});
  };
  handleGallery = selImages => {
    if (selImages === '') {
      this.setState({galleryVisible: !this.state.galleryVisible});
    } else {
      this.setState({galleryVisible: !this.state.galleryVisible});
      this.props.backHandle(selImages);
    }
  };
  getFormattedTime(time) {
    this.currentTime = time;
  }
  hasAndroidPermission = async () => {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }
  };
  render() {
    const {
      back,
      flash,
      timer,
      video,
      attachImages,
      galleryVisible,
      videoRecodingStart,
      lastImage,
    } = this.state;

    return (
      <Modal
        isVisible={this.props.isVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        statusBarTranslucent
        deviceHeight={height}
        style={styles.model}
        backdropOpacity={0}>
        <View style={styles.container}>
          {timer ? (
            <View style={styles.timerCon}>
              {this.state.timerData.map((d, i) => {
                return (
                  <TouchableOpacity
                    key={i.toString()}
                    onPress={() => this.handleTimer(d.type)}
                    style={styles.view}>
                    <View
                      style={[
                        styles.radioBtn,
                        i === 2 && {left: scale(3)},
                        {
                          backgroundColor:
                            this.state.selectedTime === d.type
                              ? theme.colors.white
                              : theme.colors.transparent,
                        },
                      ]}
                    />
                    <Text
                      style={{
                        color: theme.colors.white,
                        fontFamily:
                          this.state.selectedTime !== d.type
                            ? theme.fonts.rubikLight
                            : theme.fonts.rubicSemiBold,
                      }}>
                      {d.type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          <View style={styles.topCon}>
            {this.state.attachImages.length > 0 ? null : (
              <TouchableOpacity
                onPress={() => {
                  this.props.backHandle('close');
                }}>
                <Icon1
                  name="keyboard-backspace"
                  color={theme.colors.white}
                  size={scale(24)}
                />
              </TouchableOpacity>
            )}

            {attachImages.length > 0 ? null : (
              <View style={styles.secCon}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({back: !back});
                  }}>
                  <FastImage source={images.change} style={styles.timeImg} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({timer: !timer});
                  }}>
                  <FastImage
                    source={
                      this.state.selectedTime !== 'off'
                        ? images.stime
                        : images.time
                    }
                    style={[
                      styles.timeImg,
                      {
                        marginRight: scale(8),
                      },
                    ]}
                  />
                </TouchableOpacity>
                <Text style={styles.text}>
                  {this.state.selectedTime === 'off'
                    ? null
                    : this.state.selectedTime}
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    this.setState({flash: !flash});
                  }}>
                  <Icon3
                    name="md-flash-outline"
                    color={flash ? theme.colors.blue : theme.colors.white}
                    size={scale(22)}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {this.state.attachImages.length > 0 ? (
            <View style={styles.videoShow}>
              {this.state.attachImages[0]?.video ? (
                <VideoComponent
                  style={styles.videoShow}
                  source={{uri: this.state?.attachImages[0]?.video?.uri}} // Can be a URL or a local file.
                />
              ) : (
                <FastImage
                  source={{uri: attachImages[0]?.uri}}
                  style={styles.image}
                />
              )}
            </View>
          ) : (
            <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
              type={back ? 'front' : 'back'}
              flashMode={flash ? 'torch' : 'off'}
              androidCameraPermissionOptions={{
                title: getLocalText('Settings.cameratitle'),
                message: getLocalText('Settings.cameramessage'),
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
              androidRecordAudioPermissionOptions={{
                title: getLocalText('Settings.audiotitle'),
                message: getLocalText('Settings.audiomessage'),
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}>
              {videoRecodingStart && (
                <View style={styles.timeContainer}>
                  <Icon1
                    name="record"
                    size={scale(15)}
                    color={theme.colors.green}
                  />
                  <Stopwatch
                    laps
                    // msecs
                    start={this.state.timerStart}
                    reset={this.state.timerReset}
                    options={options}
                    getTime={this.getFormattedTime}
                  />
                </View>
              )}
            </RNCamera>
          )}

          <View style={styles.bottomCon}>
            {attachImages.length > 0 ? (
              <View style={styles.imagesView}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({attachImages: ''});
                  }}
                  style={styles.direction}>
                  <Icon
                    name="x"
                    size={scale(18)}
                    color={theme.colors.white}
                    style={{paddingHorizontal: scale(5)}}
                  />
                  <Label
                    title={getLocalText('Timeline.retake')}
                    style={{color: theme.colors.white}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.props.backHandle(attachImages);
                    this.setState({attachImages: '', selectedTime: 'off'});
                  }}
                  style={styles.direction}>
                  <Icon
                    name="check"
                    size={scale(18)}
                    color={theme.colors.white}
                    style={{paddingHorizontal: scale(5)}}
                  />
                  <Label
                    title={
                      attachImages[0]?.video
                        ? getLocalText('Timeline.usevideo')
                        : getLocalText('Timeline.useimage')
                    }
                    style={{color: theme.colors.white}}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => this.setState({galleryVisible: true})}>
                  <FastImage
                    source={{uri: lastImage}}
                    style={styles.galleryImg}
                  />
                </TouchableOpacity>

                {video ? (
                  <TouchableOpacity
                    onPress={() =>
                      videoRecodingStart
                        ? this.takeVideoStop()
                        : this.takeVideo()
                    }
                    style={styles.cameraSty}>
                    <View
                      style={[
                        styles.videoBtn,
                        {
                          borderRadius: videoRecodingStart
                            ? scale(0)
                            : scale(15),
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={this.takeImage}
                    // onLongPress={() => (video ? this.takeVideo() : null)}
                    // onPressOut={() => (video ? this.takeVideoStop() : null)}
                  >
                    <FastImage
                      source={video ? images.video : images.camera}
                      style={styles.cameraIcon}
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={{
                    right: scale(20),
                  }}
                  onPress={() => {
                    this.setState({video: !video});
                  }}>
                  <Icon
                    name={video ? 'camera' : 'video'}
                    size={scale(25)}
                    color={theme.colors.white}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        <GalleryModel
          isVisible={galleryVisible}
          handleGallery={this.handleGallery}
        />
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.black,
    width: theme.SCREENWIDTH,
    height: '100%',
    alignSelf: 'center',
    paddingTop: isIphoneX() ? scale(25) : scale(0),
    flex: 1,
  },
  model: {marginTop: 0},
  view: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {color: theme.colors.white, left: -15},
  direction: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: scale(35),
  },
  videoShow: {width: '100%', flex: 1, alignSelf: 'center'},
  topCon: {
    flexDirection: 'row',
    height: scale(70),
    paddingHorizontal: scale(18),
    backgroundColor: theme.colors.black,
    alignItems: 'center',
    top: 0,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomCon: {
    width: '100%',
    height: scale(90),
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.black,
    position: 'absolute',
    bottom: -scale(20),
    alignItems: 'center',
  },
  cameraSty: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(35),
    borderWidth: scale(2.5),
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBtn: {
    backgroundColor: theme.colors.red1,
    margin: scale(3),
    width: scale(25),
    height: scale(25),
  },
  galleryImg: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    left: scale(15),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  secCon: {
    flexDirection: 'row',
    position: 'absolute',
    right: scale(18),
    // justifyContent: 'space-between',
  },
  timerCon: {
    height: scale(111),
    width: scale(90),
    backgroundColor: theme.colors.black1,
    position: 'absolute',
    top: scale(80),
    zIndex: 111,
    alignItems: 'center',
    padding: scale(10),
    borderRadius: scale(10),
    borderTopEndRadius: -55,
    right: scale(50),
  },
  timeImg: {
    width: scale(20),
    height: scale(20),
    marginRight: scale(14),
  },
  radioBtn: {
    height: scale(18),
    width: scale(18),
    borderWidth: 1,
    borderRadius: scale(9),
    marginHorizontal: scale(10),
    borderColor: theme.colors.white,
    margin: scale(5),
  },
  cameraIcon: {
    width: scale(45),
    height: scale(45),
  },
  timeContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(30),
    position: 'absolute',
    zIndex: 111,
    top: -0,
    left: -scale(10),
  },
});

const options = {
  container: {
    // backgroundColor: '#000',
    padding: 5,
    borderRadius: 5,
    alignSelf: 'center',
    // width: 220,
  },
  text: {
    fontSize: scale(12),
    color: '#FFF',
    fontFamily: theme.fonts.muktaMedium,
    // marginLeft: scale(2),
  },
};
