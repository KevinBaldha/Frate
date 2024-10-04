import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import {AccessToken, LoginManager} from 'react-native-fbsdk-next';
import {
  appleAuth,
  appleAuthAndroid,
} from '@invertase/react-native-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import jwt_decode from 'jwt-decode';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import * as RNLocalize from 'react-native-localize';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {
  userData,
  getJoinGroupCount,
  CreatedGroupCount,
  setCoverImage,
  isLogin,
  userPreferences,
} from '../../Redux/Actions';
import {
  Button,
  InputBox,
  BackgroundChunk,
  ScreenContainer,
  Error,
  Loader,
  ErrorBox,
  Label,
  OfflineModel,
  PopUpModel,
  BlockMsgModal,
} from '../../Components';
import {getLocalText} from '../../Locales/I18n';
import {images, scale, theme, Validation, Api} from '../../Utils';
import {API, appAPI, GOOGLEWEBCLIENTID, postAPICall} from '../../Utils/appApi';
import {CLIENT_ID, RedirectUri} from '../../Utils/StaticData';
import externalStyles from '../../Css';
import {Google} from '../../Assets/SVGs';

class Login extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      email: '',
      emailerr: '',
      password: '',
      passworderr: '',
      userInfo: '',
      loadding: false,
      isConnected: true,
      errorAlert: false,
      alertErr: '',
      fcmToken: '',
      credentialStateForUser: -1,
      popUpModel: false,
      isBlockUser: false,
      blockContent: '',
    };
    this.authCredentialListener = null;
    this.userApple = null;
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }
    SplashScreen.hide();
    this.googleConfig();
    this.setFcmToken();
    this.appleConfig();
    this.initView();
  }
  initView = async () => {
    await this.setFcmToken();
  };
  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      if (this.authCredentialListener != null) {
        this.authCredentialListener();
      }
    }
  }
  //config of apple login
  appleConfig = () => {
    if (Platform.OS === 'ios') {
      this.setState({device_type: 2});
      this.authCredentialListener = appleAuth.onCredentialRevoked(async () => {
        this.fetchAndUpdateCredentialState().catch((error) =>
          this.setState({credentialStateForUser: `Error: ${error.code}`}),
        );
      });

      this.fetchAndUpdateCredentialState()
        .then((res) => this.setState({credentialStateForUser: res}))
        .catch((error) =>
          this.setState({credentialStateForUser: `Error: ${error.code}`}),
        );
    }
  };
  fetchAndUpdateCredentialState = async () => {
    if (this.userApple === null) {
      this.setState({credentialStateForUser: 'N/A'});
    } else {
      const credentialState = await appleAuth.getCredentialStateForUser(
        this.userApple,
      );
      if (credentialState === appleAuth.State.AUTHORIZED) {
        this.setState({credentialStateForUser: 'AUTHORIZED'});
      } else {
        this.setState({credentialStateForUser: credentialState});
      }
    }
  };
  handleAlert = (msg) => {
    this.setState({errorAlert: !this.state.errorAlert, alertErr: msg});
  };

  setFcmToken = async () => {
    let fcm = await AsyncStorage.getItem('fcmToken');
    this.setState({fcmToken: fcm});
  };

  googleConfig() {
    GoogleSignin.configure({
      scopes: ['profile', 'email'],
      webClientId: GOOGLEWEBCLIENTID,
      offlineAccess: false,
      forceConsentPrompt: true,
    });
  }
  //google login
  signIn = async () => {
    var fcm = await this.getFcmToken();
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      try {
        let googleFormData = new FormData();
        this.setState({loadding: true});
        googleFormData.append('email', userInfo.user.email);
        googleFormData.append('token', userInfo.user.id);
        googleFormData.append('fcm_token', fcm);
        googleFormData.append('type', 1);
        googleFormData.append('device_type', Platform.OS);
        await postAPICall(API.login, googleFormData).then((response) => {
          appAPI.defaults.headers.common.Authorization = `Bearer ${response.data?.accessToken}`;
          AsyncStorage.setItem(
            '@loginToken',
            ` Bearer ${response.data?.accessToken}`,
          );
          if (
            response?.data.user.profile_complete === null ||
            response?.data.user.profile_complete === 0
          ) {
            this.setState({loadding: false});
            let obj = {
              first_name: userInfo.user.name,
              last_name: userInfo.user.givenName,
              email: userInfo.user.email,
              user_pic: null,
              token: userInfo.user.id,
              type: 1,
              userId: response?.data?.user.id,
            };
            this.props.navigation.navigate('Signup1', {userDetail: obj});
          } else {
            this.props.userData(response?.data.user);
            this.props.totalGroupJoin(response.data?.group_count);
            this.props.CreatedGroupCount(response.data?.created_group_count);
            this.props.setCoverImage(response.data?.teams?.background_image);

            this.apiService.setToken(response?.data.accessToken);
            setTimeout(() => {
              this.setState({loadding: false});
              this.props.isLogin(true);
              this.props.navigation.replace('Tabs');
            }, 500);
          }
        });
      } catch (error) {
        this.setState({loadding: false});
      }
    } catch (error) {
      this.setState({loadding: false});
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      } else if (error.code === statusCodes.IN_PROGRESS) {
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      } else {
      }
    }
  };

  // apple login for android
  doAppleLogin = async () => {
    try {
      // Initialize the module
      appleAuthAndroid.configure({
        clientId: CLIENT_ID,
        redirectUri: RedirectUri,
        nonce: '121211',
        state: '1212121',
      });

      const response = await appleAuthAndroid.signIn();
      if (response) {
        const id_token = response.id_token; // Present if selected ResponseType.ALL / ResponseType.ID_TOKEN

        const {email} = jwt_decode(id_token);

        if (email) {
          let obj = {
            first_name: '',
            last_name: '',
            email: email,
            user_pic: '',
            token: id_token,
            type: 4,
          };
          this.mSocialLoingApi(email, id_token, obj);
        }
      }
    } catch (error) {
      if (error && error.message) {
        switch (error.message) {
          case appleAuthAndroid.Error.NOT_CONFIGURED:
            break;
          case appleAuthAndroid.Error.SIGNIN_FAILED:
            break;
          case appleAuthAndroid.Error.SIGNIN_CANCELLED:
            break;
          default:
            break;
        }
      }
    }
  };
  //apple login for ios
  async signinApple() {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const {identityToken, fullName /* etc */} = appleAuthRequestResponse;

      if (identityToken) {
        // e.g. sign in with Firebase Auth using `nonce` & `identityToken`
        const {email} = jwt_decode(identityToken);
        try {
          if (email) {
            let obj = {
              email: email,
              user_pic: '',
              token: identityToken,
              type: 4,
            };
            if (fullName) {
              obj = {
                ...obj,
                first_name: fullName.givenName,
                last_name: fullName.familyName,
              };
            } else {
              obj = {
                ...obj,
                first_name: '',
                last_name: '',
              };
            }

            this.mSocialLoingApi(email, identityToken, obj);
          }
        } catch (error) {
          this.setState({loadding: false});
        }
      }
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        console.log('SignInApple function call failed:', error);
      }
    }
  }

  getFcmToken = async () => {
    let fcm = '';
    if (this.state.fcmToken === null || !this.state.fcmToken) {
      fcm = await messaging().getToken();
    } else {
      fcm = this.state.fcmToken;
    }
    return fcm;
  };

  mSocialLoingApi = async (email, idToken, userOb) => {
    var fcm = await this.getFcmToken();
    try {
      let googleFormData = new FormData();
      this.setState({loadding: true});
      googleFormData.append('email', email);
      googleFormData.append('token', idToken);
      googleFormData.append('fcm_token', fcm);
      googleFormData.append('type', userOb.type);
      googleFormData.append('device_type', Platform.OS);
      await postAPICall(API.login, googleFormData).then((response) => {
        appAPI.defaults.headers.common.Authorization = `Bearer ${response.data?.accessToken}`;
        AsyncStorage.setItem(
          '@loginToken',
          ` Bearer ${response.data?.accessToken}`,
        );
        if (
          response?.data.user.profile_complete === null ||
          response?.data.user.profile_complete === 0
        ) {
          this.setState({loadding: false});
          let obj = {
            first_name: userOb.first_name,
            last_name: userOb.last_name,
            email: email,
            user_pic: null,
            token: idToken,
            type: userOb.type,
            userId: response?.data?.user.id,
          };
          this.props.navigation.navigate('Signup1', {userDetail: obj});
        } else {
          this.props.userData(response?.data.user);
          this.props.totalGroupJoin(response.data?.group_count);
          this.props.CreatedGroupCount(response.data?.created_group_count);
          this.props.setCoverImage(response.data?.teams?.background_image);

          this.apiService.setToken(response?.data.accessToken);
          setTimeout(() => {
            this.setState({loadding: false});
            this.props.isLogin(true);
            this.props.navigation.replace('Tabs');
          }, 500);
        }
      });
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  handleInput = (text, key, keyErr) => {
    this.setState({
      [key]: text,
      [keyErr]: '',
    });
  };

  validateForm = () => {
    let error = true;
    if (!Validation.validateEmpty(this.state.email)) {
      this.setState({emailerr: Validation.MSG_VALID.email});
      error = false;
    } else if (!Validation.validateEmail(this.state.email)) {
      this.setState({emailerr: Validation.MSG_VALID.email_valid});
      error = false;
    }
    if (!Validation.validateEmpty(this.state.password)) {
      this.setState({passworderr: Validation.MSG_VALID.password});
      error = false;
    }
    return error;
  };

  //email,password login
  handleLogin = async () => {
    var fcm = await this.getFcmToken();
    await this.setFcmToken();
    try {
      if (this.validateForm()) {
        let loginFromData = new FormData();
        this.setState({loadding: true});
        loginFromData.append('email', this.state.email);
        loginFromData.append('password', this.state.password);
        loginFromData.append('type', 3);
        loginFromData.append('fcm_token', fcm);
        loginFromData.append('device_type', Platform.OS);
        loginFromData.append(
          'country_code',
          RNLocalize.getCountry().toLocaleLowerCase(),
        );
        let success = await postAPICall(API.login, loginFromData);
        if (success.data?.is_block) {
          this.setState({loadding: false});
          await this.setState({blockContent: success.data});
          this.setState({isBlockUser: true});
        } else {
          this.props.totalGroupJoin(success.data?.group_count);
          this.props.CreatedGroupCount(success.data?.created_group_count);
          this.props.setCoverImage(success.data?.teams?.background_image);

          if (success.error) {
            this.handleAlert(getLocalText('LoginSignup.credentials'));

            this.setState({loadding: false});
          } else {
            appAPI.defaults.headers.common.Authorization = `Bearer ${success.data.accessToken}`;
            await AsyncStorage.multiSet([
              ['@loginToken', ` Bearer ${success.data.accessToken}`],
              ['@userTeamData', success.data.teams?.team_image?.original || ''],
            ]);

            this.props.userData(success.data.user);
            this.props.userPreferences(success?.data?.user?.user_meta);
            this.apiService.setToken(success.data.accessToken);
            this.setState({loadding: false});
            this.props.isLogin(true);
            this.props.navigation.replace('Tabs');
          }
        }
      }
    } catch (error) {
      this.setState({loadding: false});
      this.handleAlert(getLocalText('LoginSignup.credentials'));
    }
  };
  //login with facebook
  fbLogin = async () => {
    await this.setFcmToken();
    LoginManager.logInWithPermissions(['public_profile', 'email']).then(
      (result) => {
        if (result.isCancelled) {
        } else {
          this.getFBToken();
        }
      },
      function (error) {},
    );
  };
  getFBToken = async () => {
    var data = await AccessToken.getCurrentAccessToken();
    let token = data.accessToken.toString();
    var fcm = await this.getFcmToken();
    // this.setState({ isLoading: true })

    if (token) {
      var url = '';
      url = url.concat(
        'https://graph.facebook.com/v2.5/me?fields=email,picture,name,friends,first_name,last_name&access_token=',
        token,
      );
      var json = await axios.get(url);

      if (data) {
        json = json.data;
        try {
          let fbForamdtaa = new FormData();
          this.setState({loadding: true});
          fbForamdtaa.append('email', json.email);
          fbForamdtaa.append('token', json.id);
          // fbForamdtaa.append('login_id', json.id);
          fbForamdtaa.append('type', 2);

          fbForamdtaa.append('fcm_token', fcm);
          fbForamdtaa.append('device_type', Platform.OS);
          let success = await postAPICall(API.login, fbForamdtaa);
          appAPI.defaults.headers.common.Authorization = `Bearer ${success.data.accessToken}`;
          AsyncStorage.setItem(
            '@loginToken',
            ` Bearer ${success.data.accessToken}`,
          );
          AsyncStorage.setItem('@userTeamData', success.data.teams.team_image);
          this.setState({loadding: false});
          if (success.error) {
            this.handleAlert(success.errorMsg);
          } else {
            if (
              success.data.user.profile_complete === 0 ||
              success.data.user.profile_complete === null
            ) {
              this.setState({loadding: false});
              let obj = {
                first_name: json.first_name,
                last_name: json.first_name,
                email: json.email,
                user_pic: null,
                token: json.id,
                type: 2,
                userId: success.data.user.id,
              };
              this.props.navigation.navigate('Signup1', {userDetail: obj});
            } else {
              // to set global axios authentication header.
              appAPI.defaults.headers.common.Authorization = `Bearer ${success.data.accessToken}`;
              this.props.userData(success.data.user);
              this.apiService.setToken(success.data.accessToken);
              this.props.totalGroupJoin(success.data.group_count);
              this.props.CreatedGroupCount(success.data.created_group_count);
              this.props.setCoverImage(success.data?.teams?.background_image);

              setTimeout(() => {
                this.setState({loadding: false});
                this.props.isLogin(true);
                this.props.navigation.replace('Tabs');
              }, 700);
            }
          }
        } catch (error) {
          this.setState({loadding: false});
        }
      }
    }
    this.setState({isLoading: false});
  };

  handlePopUpModel = () => {
    this.setState({popUpModel: !this.state.popUpModel});
  };

  handleBlockUser = async () => {
    this.setState({isBlockUser: false});
  };

  render() {
    const {email, password, emailerr, passworderr, popUpModel} = this.state;
    return (
      <ScreenContainer>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <BackgroundChunk style={styles.topImage} />
          <BackgroundChunk style={styles.bottomImage} />
          <FastImage
            source={images.AppLogo}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />

          <View style={styles.inputContainer}>
            <InputBox
              keyboardType="email-address"
              placeholder={getLocalText('LoginSignup.email')}
              autoCapitalize={'none'}
              autoComplete="on"
              onChangeText={(text) =>
                this.handleInput(text, 'email', 'emailerr')
              }
              value={email}
              autoCorrect={false}
              returnKeyType="done"
            />
            {emailerr.length !== 0 ? (
              <Error error={emailerr} style={{top: scale(-15)}} />
            ) : null}

            <InputBox
              placeholder={getLocalText('LoginSignup.password')}
              secureTextEntry={true}
              value={password}
              autoCapitalize={'none'}
              onChangeText={(text) =>
                this.handleInput(text, 'password', 'passworderr')
              }
              passwordIcon
            />
            {passworderr.length !== 0 ? (
              <Error error={passworderr} style={{top: scale(-15)}} />
            ) : null}
            <TouchableOpacity
              style={[styles.forgotBtn]}
              onPress={() => {
                this.props.navigation.navigate('ForgetPassword');
              }}>
              <Text style={styles.forgotText}>
                {getLocalText('LoginSignup.forgot')}
              </Text>
            </TouchableOpacity>

            <Button
              onPress={() => {
                if (this.state.fcmToken === null) {
                  this.setFcmToken();
                  setTimeout(() => {
                    this.handleLogin();
                  }, 500);
                } else {
                  this.handleLogin();
                }
              }}
              title={getLocalText('LoginSignup.login')}
              style={styles.loginbtnStyle}
            />

            <View style={styles.rowView}>
              <TouchableOpacity
                onPress={() => {
                  this.props.navigation.navigate('Signup');
                }}
                style={[styles.forgotBtn, {marginTop: scale(15)}]}>
                <Text style={styles.forgotText}>
                  {getLocalText('LoginSignup.create')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.forgotBtn, styles.helpIcon]}
                onPress={this.handlePopUpModel}>
                <Icon
                  name={'help-circle'}
                  color={theme.colors.blue}
                  size={scale(16)}
                />
              </TouchableOpacity>
            </View>
            <PopUpModel
              isVisible={popUpModel}
              title={getLocalText('Information.accounttitle')}
              description={getLocalText('Information.accountdisc')}
              close={this.handlePopUpModel}
            />
            {/* Social Logins */}
            <View style={styles.bottomView}>
              <Label
                title={getLocalText('LoginSignup.loginWih')}
                style={styles.signupwith}
              />
              <View style={styles.socialView}>
                <Button
                  style={[externalStyles.shadow, styles.btnView]}
                  title={''}
                  titleStyle={styles.btntxt}
                  BtnImg={Google}
                  onPress={() => this.signIn()}
                />
                <Button
                  style={[externalStyles.shadow, styles.btnView]}
                  title={''}
                  titleStyle={styles.btntxt}
                  Icon={'logo-apple'}
                  onPress={() => {
                    if (Platform.OS === 'android') {
                      this.doAppleLogin();
                    } else {
                      this.signinApple();
                    }
                  }}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <OfflineModel />
        <Loader loading={this.state.loadding} />
        {this.state.errorAlert ? (
          <ErrorBox
            loadding={this.state.errorAlert}
            error={this.state.alertErr}
            close={this.handleAlert}
          />
        ) : null}
        <BlockMsgModal
          show={this.state.isBlockUser}
          closeModal={() => this.handleBlockUser()}
          data={this.state.blockContent}
          navigation={this.props.navigation}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.25),
    left: -(theme.SCREENHEIGHT * 0.55),
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: theme.SCREENHEIGHT * 0.1,
    height: scale(100),
    width: scale(100),
  },
  forgotBtn: {
    alignSelf: 'center',
  },
  forgotText: {
    color: theme.colors.blue,
    fontSize: scale(14),
    fontFamily: theme.fonts.muktaSemiBold,
    textDecorationLine: 'underline',
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.4),
    right: -(theme.SCREENHEIGHT * 0.42),
  },
  bottomView: {
    paddingHorizontal: scale(30),
    width: '100%',
    alignSelf: 'center',
    backgroundColor: theme.colors.white3,
    justifyContent: 'space-evenly',
    position: 'absolute',
    bottom: scale(0),
  },
  signupwith: {
    marginTop: scale(5),
    textAlign: 'center',
  },
  socialView: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnView: {
    width: theme.SCREENHEIGHT * 0.08,
    height: theme.SCREENHEIGHT * 0.08,
    backgroundColor: theme.colors.white,
    borderRadius: theme.SCREENHEIGHT * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  btntxt: {
    color: theme.colors.black,
    fontFamily: theme.fonts.robotoNormal,
    fontSize: scale(13),
    marginLeft: scale(4),
  },
  loginbtnStyle: {
    marginTop: theme.SCREENHEIGHT * 0.03,
    zIndex: 111,
  },
  inputContainer: {
    marginTop: theme.SCREENHEIGHT * 0.05,
    flex: 1,
    minHeight: theme.SCREENHEIGHT * 0.711,
  },
  helpIcon: {
    marginLeft: scale(11),
    marginTop: scale(15),
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => ({
  loginstatus: state.AppReducer.loginstatus,
  groupCount: state.UserInfo.joinGroupCount,
});

const mapDispatchToProps = (dispatch) => {
  return {
    isLogin: (params) => dispatch(isLogin(params)),
    userData: (params) => dispatch(userData(params)),
    userPreferences: (params) => dispatch(userPreferences(params)),
    totalGroupJoin: (params) => dispatch(getJoinGroupCount(params)),
    CreatedGroupCount: (params) => dispatch(CreatedGroupCount(params)),
    setCoverImage: (params) => dispatch(setCoverImage(params)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
