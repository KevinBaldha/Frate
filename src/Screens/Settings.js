import React, {Component} from 'react';
import {View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager} from 'react-native-fbsdk-next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-simple-toast';
import {connect} from 'react-redux';
import {
  DeleteAccountModel,
  ScreenContainer,
  Label,
  SearchBar,
  BackgroundChunk,
  SearchModel,
  OfflineModel,
  Loader,
} from '../Components';
import {scale, theme, Api, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {isLogin, logout, userData} from '../Redux/Actions';
import {API, deleteAPICall, postAPICall} from '../Utils/appApi';
import {checkValidUrl} from '../Utils/helper';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      isDeleteAccount: false,
      loading:false,
      searchText: '',
      searchModel: false,
      options: [
        {
          title: 'Settings.profile',
          image:
            !this.props?.userDatas ||
            this.props?.userDatas?.user_pic?.optimize === undefined
              ? 'data:image/png;base64,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'
              : this.props?.userDatas?.user_pic?.optimize,
          navigation: 'UpdateProfile',
        },
        {
          title: 'Settings.notifications',
          icon: 'bell',
          navigation: 'Notifications',
        },
        {title: 'Settings.privacytxt', icon: 'lock', navigation: 'Security'},
        {
          title: 'Settings.sponsoredcontent',
          icon: 'dollar-sign',
          navigation: 'Sponsor',
        },
        {title: 'Settings.help', icon: 'help-circle', navigation: 'Help'},
      ],
      searchFoucs: false,
    };
  }
  handleOption = (navProps) => this.props.navigation.navigate(navProps);

  clearAsyncStorage = async () => {
    try {
      await this.googlesignOut();
      await this.logOut();
      const keys = await AsyncStorage.getAllKeys();
      var newKeys = keys.filter(item => item !== 'fcmToken');
      this.props.logout();
      newKeys.map(item => {
        AsyncStorage.removeItem(item);
      });
      await postAPICall(API.logOut);
    } catch (error) {
      console.log('An error occurred:', error);
    }
  };
  async logOut() {
    try {
      await LoginManager.logOut();
    } catch (error) {
      return 'LoginManager logOut API call failed:' + error;
    }
  }
  async googlesignOut() {
    if (GoogleSignin) {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        return 'Google signOut API call failed:' + error;
      }
    }
  }

  //close search model
  searchClose = () => this.setState({searchModel: !this.state.searchModel});

  notificationPress = async () => this.props.navigation.navigate('Notification');

  onConfirmAccountDeletion=async()=>{
    this.setState({isDeleteAccount: false});
    this.setState({loading:true});

      const userId = this.props?.userDatas?.id;

      try {
        let deleteUser = await deleteAPICall(API.user + userId);

        if (deleteUser.success) {
          this.props.isLogin(false);
          this.props.logout();
          this.apiService.setToken('');
          this.clearAsyncStorage();
          this.setState({loading:false});
          Toast.show('Your account has been successfully deleted!', Toast.SHORT);
          // Toast.show(deleteUser.message, Toast.SHORT);
          this.props.navigation.replace('Login');
        } else {
          this.setState({loading:false});
          Alert.alert(deleteUser.errorMsg.message);
        }
      } catch (error) {
        this.setState({loading:false});
        Alert.alert(error);
      }
  };

  render() {
    const {options, searchModel} = this.state;
    const {notificationBell} = this.props;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <SearchBar
          {...this.props}
          onNotificationPress={() => {
            this.notificationPress();
          }}
          bellColor={
            notificationBell ? theme.colors.blue : theme.colors.darkGrey
          }
          notificationBadge={notificationBell}
          onSearchPress={() =>
            this.setState({searchModel: !this.state.searchModel})
          }
          hideSearch
        />
        <Label title={getLocalText('Settings.settings')} style={styles.title} />
        {options.map((item, index) => {
          return (
            <TouchableOpacity
              key={index.toString()}
              onPress={() => {
                this.handleOption(item?.navigation);
              }}
              style={styles.container}>
              {item?.image ? (
                <FastImage
                  source={
                    checkValidUrl(this.props?.userDatas?.user_pic?.optimize) ===
                    undefined
                      ? images.defaultUser
                      : {uri: this.props?.userDatas?.user_pic?.optimize}
                  }
                  style={styles.profile}
                  resizeMode={'cover'}
                />
              ) : (
                <View style={styles.profile}>
                  <Icon
                    name={item?.icon}
                    size={scale(17)}
                    color={theme.colors.blue}
                  />
                </View>
              )}
              <Label title={getLocalText(item?.title)} />
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={() => {
            this.props.isLogin(false);
            this.props.navigation.replace('Login');
            this.props.logout();
            this.apiService.setToken('');
            this.clearAsyncStorage();
          }}
          style={styles.btncontainer}>
          <View style={styles.profile}>
            <Icon name="log-out" size={scale(17)} color={theme.colors.blue} />
          </View>
          <Label title={`${getLocalText('Settings.signOut')}`} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState({isDeleteAccount: true})}
          style={styles.btncontainer1}>
          <View style={styles.profile}>
            <Icon name="trash-2" size={scale(17)} color={theme.colors.blue} />
          </View>
          <Label title={`${getLocalText('Settings.deleteAccount')}`} />
        </TouchableOpacity>
        <View style={styles.versionContainer}>
          <Label title={`V.${DeviceInfo.getBuildNumber()}.22.7`} />
        </View>

        <OfflineModel />
        <DeleteAccountModel
          isVisible={this.state.isDeleteAccount}
          close={() => this.setState({isDeleteAccount: false})}
          onDeleteAccount={()=>this.onConfirmAccountDeletion()}
        />
        <SearchModel isVisible={searchModel} closeSearch={this.searchClose} />

        <Loader loading={this.state.loading} />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.55),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '80deg'}],
  },
  versionContainer: {
    position: 'absolute',
    paddingHorizontal: scale(15),
    bottom: scale(10),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.6),
    left: -(theme.SCREENHEIGHT * 0.5),
    transform: [{rotate: '80deg'}],
  },
  title: {
    marginLeft: scale(18),
    marginTop: scale(20),
    marginBottom: scale(10),
    color: theme.colors.black,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(18),
    marginTop: scale(20),
  },
  btncontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(18),
    marginTop: scale(20),
    position: 'absolute',
    bottom: scale(70),
  },
  btncontainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(18),
    marginTop: scale(20),
    position: 'absolute',
    bottom: scale(35),
  },
  profile: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(9),
  },
});

const mapStateToProps = state => {
  const loginstatus = state.AppReducer.login;
  const userDatas = state.UserInfo.data;
  const userToken = state.UserInfo.userToken;
  const notificationBell = state.UserInfo.notificationBellIcon;
  return {loginstatus, userDatas, userToken, notificationBell};
};
export default connect(mapStateToProps, {
  isLogin,
  logout,
  userData,
})(Settings);
