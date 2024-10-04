import React, {Component} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import {
  Button,
  InputBox,
  HeaderView,
  BackgroundChunk,
  ScreenContainer,
  Title,
  Label,
  Error,
  MediaOptions,
} from '../../Components';
import {getLocalText} from '../../Locales/I18n';
import {scale, theme, imagesOptions, Validation, images} from '../../Utils';

import externalStyle from '../../Css';

class Signup1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: this.props.route.params.userDetail,
      keyboardStatus: false,
      aboutme: '',
      aboutmeErr: '',
      imageErr: '',
      userImage: '',
      mediaOption: false,
      coverImage: '',
      aboutPlaceHolder: getLocalText('LoginSignup.aboutplaceholder'),
    };
  }

  handleMediaOptions = () => {
    this.setState({mediaOption: !this.state.mediaOption});
  };
  openImagePicker = () => {
    ImagePicker.openPicker({
      imagesOptions,
      mediaType: 'photo',
      compressImageQuality: 0.8,
      cropping: true,
    }).then((res) => {
      ImageResizer.createResizedImage(res.path, 600, 600, 'JPEG', 30, 0)
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
          this.setState({mediaOption: false});
          this.showError(err);
        });
    });
  };

  handleCoverImage = () => {
    ImagePicker.openPicker({
      imagesOptions,
      mediaType: 'photo',
      compressImageQuality: 0.8,
      cropping: true,
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
  validateForm = () => {
    let error = true;
    this.setState({
      imageErr: '',
      aboutmeErr: '',
    });

    if (this.state.userImage.length === 0) {
      this.setState({imageErr: Validation.MSG_VALID.profile_pic});
      error = false;
    }

    if (!Validation.validateEmpty(this.state.aboutme)) {
      this.setState({aboutmeErr: Validation.MSG_VALID.about});
      error = false;
    }
    return error;
  };

  handleSignup = () => {
    // if (this.validateForm()) {
    const data = {
      user_pic: this.state.userImage,
      about_user: this.state.aboutme,
      cover_image: this.state.coverImage,
      type:
        this.state.userInfo.type === undefined ? 3 : this.state.userInfo.type,
    };
    const userinfo = Object.assign(this.state.userInfo, data);
    this.setState({userInfo: userinfo});
    setTimeout(() => {
      this.props.navigation.navigate('Signup4', {
        userDetail: this.state.userInfo,
      });
    }, 300);
    // }
  };
  render() {
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView {...this.props} title={getLocalText('LoginSignup.login')} />
        <KeyboardAwareScrollView>
          <Title
            title={getLocalText('LoginSignup.create')}
            style={styles.title}
          />
          <Label
            title={getLocalText('LoginSignup.setimage')}
            style={styles.label}
          />
          <Label
            title={getLocalText('LoginSignup.imagesize')}
            style={styles.text}
          />
          <View style={styles.imageContainer}>
            {this.state.userImage !== '' ? (
              <FastImage source={this.state.userImage} style={styles.image} />
            ) : (
              <View style={[styles.imageCon, externalStyle.shadow]}>
                <FastImage
                  source={images.profilepick}
                  style={styles.profileImage}
                  resizeMode={'contain'}
                />
              </View>
            )}

            <Button
              onPress={() => {
                this.handleMediaOptions();
              }}
              style={[
                styles.imageButton,
                {
                  backgroundColor:
                    this.state.userImage !== ''
                      ? theme.colors.grey2
                      : theme.colors.blue,
                },
              ]}
              title={
                this.state.userImage !== ''
                  ? getLocalText('LoginSignup.editimage')
                  : getLocalText('LoginSignup.selectimage')
              }
            />
          </View>
          {this.state.imageErr.length !== 0 ? (
            <Error error={this.state.imageErr} style={{top: scale(-15)}} />
          ) : null}
          <Label
            title={getLocalText('LoginSignup.about')}
            style={[styles.label, {marginTop: theme.SCREENHEIGHT * 0.035}]}
          />

          <InputBox
            style={{
              marginVertical: scale(6),
              height: theme.SCREENHEIGHT * 0.35,
            }}
            numberOfLines={5}
            inputStyle={styles.inputStyle}
            placeholder={this.state.aboutPlaceHolder}
            value={this.state.aboutme}
            textAlignVertical="top"
            onChangeText={(text) => this.setState({aboutme: text})}
            multiline={true}
            onBlur={() =>
              this.setState({
                aboutPlaceHolder: getLocalText('LoginSignup.aboutplaceholder'),
              })
            }
            onFocus={() => this.setState({aboutPlaceHolder: ''})}
          />

          {this.state.aboutmeErr.length !== 0 ? (
            <Error error={this.state.aboutmeErr} style={{top: scale(-15)}} />
          ) : null}
          <Button
            onPress={() => {
              this.handleSignup();
            }}
            title={getLocalText('LoginSignup.confirm')}
            buttonview={{top: scale(10), alignSelf: 'center'}}
          />
        </KeyboardAwareScrollView>
        <MediaOptions
          isVisible={this.state.mediaOption}
          onPressCamera={() => {
            this.openCamera();
          }}
          onPressGallery={() => {
            this.openImagePicker();
          }}
          signup={true}
          close={() => {
            this.handleMediaOptions();
          }}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginLeft: scale(30),
    marginTop: theme.SCREENHEIGHT * 0.02,
    marginBottom: theme.SCREENHEIGHT * 0.01,
  },
  imageContainer: {
    marginHorizontal: scale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scale(22),
  },
  label: {
    marginLeft: scale(30),
  },
  text: {
    fontSize: scale(13),
    marginLeft: scale(30),
    color: theme.colors.black,
    fontFamily: theme.fonts.muktaRegular,
  },
  imageCon: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  imageButton: {width: scale(160), marginHorizontal: 0, marginBottom: 0},
  image: {
    width: scale(100),
    height: scale(100),
    borderRadius: scale(50),
  },
  profileImage: {
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
  inputStyle: {
    height: theme.SCREENHEIGHT * 0.28,
    padding: scale(7),
    textAlign: 'left',
    color: theme.colors.grey2,
    fontSize: scale(13),
    fontFamily: theme.fonts.muktaMedium,
  },
});

export default Signup1;
