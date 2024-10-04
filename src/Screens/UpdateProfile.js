import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import Icon from 'react-native-vector-icons/Feather';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import {
  Button,
  InputBox,
  HeaderView,
  BackgroundChunk,
  ScreenContainer,
  Label,
  FullMediaModel,
  Loader,
  MediaOptions,
  OfflineModel,
} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, imagesOptions, Api} from '../Utils';
import {API, postAPICall} from '../Utils/appApi';
import externalStyle from '../Css';
import {userData} from '../Redux/Actions';

class UpdateProfile extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      keyboardStatus: false,
      name: '',
      email: '',
      userImage: '',
      current_password: '',
      new_password: '',
      change: false,
      loadding: false,
      userId: '',
      fullScreenMedia: false,
      mediaOption: false,
      coverImage: '',
    };
  }

  componentDidMount() {
    this.userDetails();
  }
  userDetails() {
    this.setState({
      userImage: {
        uri: this.props?.userDatas?.user_pic?.optimize,
        mediaType: 'image',
      },
      name: this.props?.userDatas?.first_name,
      email: this.props?.userDatas?.email,
      userId: this.props?.userDatas?.id,
      coverImage: {
        uri: this.props?.userDatas?.cover_pic?.optimize,
        mediaType: 'image',
      },
    });
  }
  handleClose = () => {
    this.setState({fullScreenMedia: !this.state.fullScreenMedia});
  };
  openCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
    }).then((image) => {
      ImageResizer.createResizedImage(image.path, 600, 600, 'JPEG', 30, 0)
        .then((compressedImage) => {
          this.setState({
            userImage: {
              uri:
                Platform.OS === 'ios'
                  ? compressedImage.path
                  : compressedImage.uri,
              type: 'image/jpeg',
              name: compressedImage.name,
            },
            mediaOption: false,
          });
        })
        .catch((err) => {
          this.showError(err);
        });
    });
  };
  openImagePicker = () => {
    ImagePicker.openPicker({
      imagesOptions,
      mediaType: 'photo',
      compressImageQuality: 0.8,

      // cropping: true,
    }).then((res) => {
      ImageResizer.createResizedImage(res.path, 600, 600, 'JPEG', 20, 0)
        .then((compressedImage) => {
          this.setState({
            userImage: {
              uri:
                Platform.OS === 'ios'
                  ? compressedImage.path
                  : compressedImage.uri,
              type: 'image/jpeg',
              name: compressedImage.name,
            },
            mediaOption: false,
          });
        })
        .catch((err) => {
          this.showError(err);
        });
    });
  };

  handleInput = (text, key, keyErr) => {
    this.setState({
      [key]: text,
      [keyErr]: '',
    });
  };
  handleMediaOptions = () => {
    this.setState({mediaOption: !this.state.mediaOption});
  };
  handleUpdate = async () => {
    let userId = this.props.userDatas?.id;
    try {
      let updateUserData = new FormData();
      this.setState({loadding: true});
      updateUserData.append('email', this.state.email);
      updateUserData.append('first_name', this.state.name);
      this.state.userImage.uri !== this.props.userDatas?.user_pic?.optimize
        ? updateUserData.append('user_pic', this.state.userImage)
        : '';
      this.state.coverImage.uri !== this.props.userDatas?.cover_pic?.optimize
        ? updateUserData.append('cover_image', this.state.coverImage)
        : '';
      this.state.current_password !== ''
        ? updateUserData.append('current_password', this.state.current_password)
        : '';
      this.state.new_password !== ''
        ? updateUserData.append('new_password', this.state.new_password)
        : '';
      const response = await postAPICall(
        API.updateProfile + userId,
        updateUserData,
      );
      if (response.success) {
        this.props.userData(response.data.user);
        this.setState({loadding: false});
        await this.props.navigation.navigate('Settings');
      } else {
        this.setState({loadding: false});
      }
    } catch (error) {
      this.setState({loadding: false});
      Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
    }
  };

  removeImage = async () => {
    try {
      let updateUserData = new FormData();
      updateUserData.append('type', 'profile');
      try {
        this.setState({loadding: true});
        const response = await postAPICall(API.removeProfile, updateUserData);
        this.props.userData(response.data);
        this.setState({userImage: '', mediaOption: false, loadding: false});
      } catch (error) {
        Alert.alert(getLocalText('ErrorMsgs.Something_went_wrong'));
      }
    } catch (error) {
      Alert.alert(getLocalText('ErrorMsgs.Something_went_wrong'));
    }
  };

  handleCoverImage = () => {
    ImagePicker.openPicker({
      imagesOptions,
      mediaType: 'photo',
      compressImageQuality: 0.8,
      // cropping: true,
    }).then((res) => {
      ImageResizer.createResizedImage(res.path, 600, 600, 'JPEG', 30, 0)
        .then((compressedImage) => {
          this.setState({
            coverImage: {
              uri:
                Platform.OS === 'ios'
                  ? compressedImage.path
                  : compressedImage.uri,
              type: 'image/jpeg',
              name: compressedImage.name,
            },
          });
        })
        .catch((err) => {
          this.setState({mediaOption: false});
          this.showError(err);
        });
    });
  };
  render() {
    const {current_password, new_password, name, email, change, coverImage} =
      this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView {...this.props} title={getLocalText('Settings.profile')} />
        <KeyboardAwareScrollView>
          <View style={styles.imageContainer}>
            {this.state.userImage !== '' ? (
              <TouchableOpacity
                onPress={() => {
                  this.handleClose();
                }}>
                <FastImage
                  source={{uri: this.state.userImage?.uri}}
                  // source={images.profilepick}
                  style={styles.image}
                />
              </TouchableOpacity>
            ) : (
              <View style={[styles.imageCon, externalStyle.shadow]}>
                <Icon name="user" color={theme.colors.grey3} size={scale(24)} />
              </View>
            )}

            <Button
              onPress={() => {
                this.handleMediaOptions();
              }}
              style={styles.imageButton}
              title={getLocalText('LoginSignup.update')}
              titleStyle={styles.txt}
            />
          </View>
          <Label
            title={getLocalText('LoginSignup.name')}
            style={[styles.label, {marginTop: theme.SCREENHEIGHT * 0.02}]}
          />
          <InputBox
            placeholder={getLocalText('LoginSignup.name')}
            value={name}
            onChangeText={(text) => this.handleInput(text, 'name', 'errname')}
          />
          <Label
            title={getLocalText('LoginSignup.email')}
            style={[styles.label]}
          />
          <InputBox
            placeholder={getLocalText('LoginSignup.email')}
            value={email}
            // editable={false}
            onChangeText={(text) => this.handleInput(text, 'email', 'erremail')}
          />
          <View style={styles.row}>
            <Label
              title={
                // change
                //   ?
                getLocalText('LoginSignup.current_password')
                // : getLocalText('LoginSignup.password')
              }
              style={[styles.label]}
            />
          </View>

          <InputBox
            placeholder={getLocalText('LoginSignup.current_password')}
            secureTextEntry={true}
            value={current_password}
            onChangeText={(text) =>
              this.handleInput(text, 'current_password', 'passworderr')
            }
            passwordIcon
            // editable={change ? true : false}
          />
          <>
            <Label
              title={getLocalText('LoginSignup.new_password')}
              style={[styles.label]}
            />
            <InputBox
              placeholder={getLocalText('LoginSignup.new_password')}
              secureTextEntry={true}
              value={new_password}
              onChangeText={(text) =>
                this.handleInput(text, 'new_password', 'passworderr')
              }
              passwordIcon
            />
          </>

          <Button
            onPress={() => {
              this.handleUpdate();
            }}
            title={getLocalText('LoginSignup.updatebtn')}
            style={{top: -theme.SCREENHEIGHT * 0.0018}}
          />
        </KeyboardAwareScrollView>

        <OfflineModel />
        <Loader loading={this.state.loadding} />
        <FullMediaModel
          isShow={this.state.fullScreenMedia}
          closeModel={this.handleClose}
          postImages={this.state.userImage}
        />
        <MediaOptions
          isVisible={this.state.mediaOption}
          onPressCamera={() => {
            this.openCamera();
          }}
          onPressGallery={() => {
            this.openImagePicker();
          }}
          signup={true}
          edit={true}
          close={() => {
            this.handleMediaOptions();
          }}
          onPressRemove={() => this.removeImage()}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: scale(35),
  },
  label: {
    marginLeft: scale(30),
  },
  row: {flexDirection: 'row'},
  imageCon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  imageButton: {
    width: scale(160),
    marginHorizontal: 0,
    marginBottom: 0,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    marginTop: scale(15),
    justifyContent: 'center',
  },
  txt: {color: theme.colors.blue, textAlign: 'center'},
  image: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.25),
    left: -(theme.SCREENHEIGHT * 0.55),
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.4),
    right: -(theme.SCREENHEIGHT * 0.42),
  },
});

const mapStateToProps = (state) => ({
  userDatas: state.UserInfo.data,
});

const mapDispatchToProps = (dispatch) => {
  return {
    userData: (params) => dispatch(userData(params)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateProfile);
