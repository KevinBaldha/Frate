/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import {Dropdown} from 'react-native-element-dropdown';
import * as RNLocalize from 'react-native-localize';
import {connect} from 'react-redux';
import messaging from '@react-native-firebase/messaging';
import {
  BackgroundChunk,
  ErrorBox,
  HeaderView,
  Loader,
  ScreenContainer,
  Title,
  Button,
  Label,
  ChooseCityPopup,
} from '../../Components';
import {getLocalText} from '../../Locales/I18n';
import {scale, theme, Api, images} from '../../Utils';
import {
  isLogin,
  getJoinGroupCount,
  userData,
  CreatedGroupCount,
  setCoverImage,
  userPreferences,
} from '../../Redux/Actions';
import {appAPI, API, getAPICall} from '../../Utils/appApi';
import externalStyle from '../../Css';
import {checkValidUrl, handleError, handleResponse} from '../../Utils/helper';
import FastImage from 'react-native-fast-image';
let loadMoreData = false;
class Signup4 extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      userDetail: this.props?.route?.params?.userDetail,
      team: '',
      loadding: false,
      errorAlert: false,
      alertErr: '',
      teamData: [],
      selectedId: '',
      activeItem: null,
      fcmToken: '',
      cityPopup: false,
      page: 1,
      totalPage: 1,
      loadmore: false,
      searchText: '',
      cityName: '',
      getContinentData: [],
      getCountryData: [],
      getCityData: [],
      getSelectedContinet: '',
      getSelectedCountry: '',
      getSelectedCities: '',
      countryDisable: true,
      cityDisable: true,
    };
  }
  animateValue = new Animated.Value(0);
  componentDidMount() {
    this.getContinents();
    this.setFcmToken();
  }

  //set fcm token
  setFcmToken = async () => {
    let fcm = await AsyncStorage.getItem('fcmToken');
    this.setState({fcmToken: fcm});
  };

  getTeams = async (id) => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.apiteam + id);
      this.setState({
        teamData: response.data,
        loadding: false,
        totalPage: response?.total_page,
      });
    } catch (error) {
      this.setState({
        loadding: false,
      });
    }
  };

  getContinents = async () => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.getContinents);
      this.setState({
        getContinentData: response.data,
        loadding: false,
      });
    } catch (error) {
      this.setState({
        loadding: false,
      });
    }
  };

  getCountry = async (id) => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.getCountries + id);
      this.setState({
        getCountryData: response.data,
        loadding: false,
      });
    } catch (error) {
      this.setState({
        loadding: false,
      });
    }
  };

  getCities = async (id) => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.getCities + id);
      this.setState({
        getCityData: response.data,
        loadding: false,
      });
    } catch (error) {
      this.setState({
        loadding: false,
      });
    }
  };

  renderFooter = () => {
    if (!this.state.loadmore) {
      return null;
    } else {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.blue}
          style={{marginBottom: scale(5)}}
        />
      );
    }
  };

  loadMore = async () => {
    if (this.state.page <= this.state.totalPage && !loadMoreData) {
      let page = this.state.page + 1;
      if (page < this.state.totalPage) {
        this.setState({loadmore: true});
        loadMoreData = true;
        let response = await getAPICall(API.apiteam + '&page=' + page);
        let data = [...this.state.teamData, ...response.data];
        this.setState({
          teamData: data,
          loadmore: false,
          page: page,
        });
        loadMoreData = false;
      }
    } else {
      this.setState({loadmore: false});
    }
  };

  handleAlert = (msg) => {
    this.setState({errorAlert: !this.state.errorAlert, alertErr: msg});
  };

  //team selection
  handleClick = async (item) => {
    this.setState({selectedId: item});
  };

  //Signup User
  handleSignup = async () => {
    let fcm = '';
    if (this.state.fcmToken === null || !this.state.fcmToken) {
      fcm = await messaging().getToken();
    } else {
      fcm = await this.state.fcmToken;
    }

    this.setState({cityPopup: !this.state.cityPopup});
    if (this.state.selectedId) {
      let defaultImg = this.state.userDetail.user_pic;
      const team = {team: this.state.selectedId};
      const userinfo = Object.assign(this.state.userDetail, team);
      this.setState({userDetail: userinfo, loadding: true});
      try {
        if (this.state.userDetail.type === 3) {
          let userFormData = new FormData();
          userFormData.append('first_name', this.state.userDetail.first_name);
          userFormData.append('last_name', this.state.userDetail.last_name);
          userFormData.append('email', this.state.userDetail.email);
          userFormData.append('password', this.state.userDetail.password);
          userFormData.append(
            'confirm_password',
            this.state.userDetail.confirm_password,
          );
          userFormData.append('gender', this.state.userDetail.gender);
          userFormData.append('device_type', Platform.OS);
          userFormData.append('about_user', this.state.userDetail.about_user);
          if (defaultImg) {
            userFormData.append('user_pic', defaultImg);
          }
          userFormData.append('team_ids[]', this.state.selectedId);
          userFormData.append('type', this.state.userDetail.type);
          userFormData.append('fcm_token', fcm);
          userFormData.append('cover_image', this.state.userDetail.cover_image);
          userFormData.append('country', this.state.cityName);
          userFormData.append('country_code', RNLocalize.getCountry());

          let response = await this.postAPICall(API.signUp, userFormData);
          if (response.message) {
            if (this.state.loadding) {
              this.setState({loadding: false});
            }
          }
          if (response.success) {
            this.props.userData(response.data.user);
            this.props.userPreferences(response?.data?.user?.user_meta);
            appAPI.defaults.headers.common.Authorization = `Bearer ${response.data.accessToken}`;
            AsyncStorage.setItem(
              '@loginToken',
              ` Bearer ${response.data.accessToken}`,
            );
            AsyncStorage.setItem(
              '@userTeamData',
              response.data.teams.team_image?.original,
            );
            this.props.totalGroupJoin(response.data.group_count);
            this.props.CreatedGroupCount(response.data.created_group_count);
            this.props.setCoverImage(response.data?.teams?.background_image);

            this.apiService.setToken(response.data.accessToken);
            this.setState({loadding: false});
            setTimeout(() => {
              this.props.isLogin(true);
              // this.props.navigation.navigate('Tabs'),
              this.props.navigation.reset({
                index: 0,
                routes: [{name: 'Tabs'}],
              }),
                {
                  signup: true,
                };
            }, 500);
          } else {
            this.setState({loadding: false});
            if (response.error) {
              // this.handleAlert(response.data.email[0]);
              this.handleAlert(response.errorMsg);
            } else if (response.message === 'Validation Error.') {
              this.handleAlert(response.data.email[0]);
            } else {
              this.setState({loadding: false});
              this.handleAlert(response.message);
            }
          }
        }
        //when signup with google & Facebook
        else {
          let socialSignup = new FormData();
          socialSignup.append('first_name', this.state.userDetail.first_name);
          socialSignup.append('last_name', this.state.userDetail.last_name);
          socialSignup.append('about_user', this.state.userDetail.about_user);
          socialSignup.append('user_pic', defaultImg);
          socialSignup.append('team_ids[]', this.state.selectedId);
          socialSignup.append('device_type', Platform.OS);
          socialSignup.append('fcm_token', fcm);
          socialSignup.append('cover_image', this.state.userDetail.cover_image);

          let success = await this.postAPICall(
            API.updateProfile + this.state.userDetail.userId,
            socialSignup,
          );
          if (success.message) {
            if (this.state.loadding) {
              this.setState({loadding: false});
            }
          }
          if (success.success) {
            this.props.userData(success.data.user);

            this.props.totalGroupJoin(
              success.data.group_count === undefined
                ? 0
                : success.data.group_count,
            );
            this.props.CreatedGroupCount(success.data?.created_group_count);
            this.props.setCoverImage(success.data?.teams?.background_image);

            this.setState({loadding: false});
            setTimeout(() => {
              this.props.isLogin(true);
              this.props.navigation.navigate('Tabs', {
                signup: true,
              });
            }, 500);
          } else {
            this.setState({loadding: false});
            if (success.error) {
              this.handleAlert(success.errorMsg);
            } else if (success.message === 'Validation Error.') {
              this.handleAlert(success.data.email[0]);
            } else {
              this.setState({loadding: false});
              this.handleAlert(success.message);
            }
          }
        }
      } catch (error) {
        this.setState({loadding: false});
      }
    } else {
      this.handleAlert(getLocalText('ErrorMsgs.team'));
    }
  };
  animate = (index) => {
    this.setState({
      activeItem: index,
    });
    Animated.sequence([
      Animated.spring(this.animateValue, {
        toValue: 1,
        fontSize: 12,
      }),
      Animated.spring(this.animateValue, {
        toValue: 0,
      }),
    ]).start();
  };

  animationMap = this.animateValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  //team data display
  renderItem = ({item, index}) => {
    const TeamBack = item?.team_image?.optimize;
    return (
      <View>
        <TouchableOpacity
          style={[
            styles.card,
            {
              marginRight: index % 2 ? scale(0) : scale(14),
            },
            externalStyle.shadow,
          ]}
          onPress={() => {
            this.handleClick(item?.id);
            this.animate(index);
            this.setState({cityName: item?.city?.name});
          }}>
          <FastImage
            source={checkValidUrl(TeamBack) ? {uri: TeamBack} : images.team4}
            style={styles.cardImage}
            resizeMode="center"
          />
          {this.state.activeItem === index && (
            <Icon
              name={'check'}
              color={theme.colors.white}
              size={scale(35)}
              style={styles.checkImage}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  postAPICall = (url, requestData) => {
    return appAPI
      .post(url, requestData)
      .then((res) => {
        return handleResponse(res);
      })
      .catch((e) => {
        if (e.response) {
          if (e.response.data && e.response.data.errors.email) {
            return handleError(e.response.data.errors.email);
          }
          return handleError(e.response.data.message);
        } else {
          return handleError(e.message);
        }
      });
  };

  handleChooseCityPopup = () => {
    this.setState({cityPopup: !this.state.cityPopup});
  };

  onPressCancel = () => {
    this.setState({selectedId: '', cityPopup: !this.state.cityPopup});
  };

  render() {
    const {
      teamData,
      cityPopup,
      selectedId,
      cityName,
      getContinentData,
      getSelectedContinet,
      getCountryData,
      getSelectedCountry,
      countryDisable,
      getCityData,
      getSelectedCities,
      cityDisable,
    } = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView {...this.props} title={getLocalText('LoginSignup.login')} />
        <Title
          title={getLocalText('LoginSignup.chooseteam')}
          style={styles.title}
        />
        <Label
          title={getLocalText('LoginSignup.chooseCityText')}
          style={styles.subTitle}
        />

        <Dropdown
          style={styles.searchView}
          placeholderStyle={styles.placeholderStyle}
          placeholder={getLocalText('LoginSignup.chooseContinent')}
          selectedTextStyle={styles.selectedTextStyle}
          data={getContinentData}
          onChange={(item) => {
            this.setState({getSelectedContinet: item, countryDisable: false});
            this.getCountry(item?.value);
          }}
          value={getSelectedContinet}
          iconColor={theme.colors.blue}
          itemTextStyle={{color: theme.colors.grey2}}
          containerStyle={{borderRadius: scale(10)}}
          labelField="label"
          valueField="value"
        />

        <Dropdown
          style={[
            styles.searchView,
            {
              borderColor: countryDisable
                ? theme.colors.grey
                : theme.colors.blue,
            },
          ]}
          placeholderStyle={styles.placeholderStyle}
          placeholder={getLocalText('LoginSignup.chooseCountry')}
          selectedTextStyle={styles.selectedTextStyle}
          data={getCountryData}
          onChange={(item) => {
            this.setState({getSelectedCountry: item, cityDisable: false});
            this.getCities(item?.value);
          }}
          value={getSelectedCountry}
          iconColor={
            getSelectedCountry === '' ? theme.colors.grey : theme.colors.blue
          }
          itemTextStyle={{color: theme.colors.grey2}}
          containerStyle={{borderRadius: scale(10)}}
          disable={countryDisable}
          labelField="label"
          valueField="value"
        />

        <Dropdown
          style={[
            styles.searchView,
            {
              borderColor: cityDisable ? theme.colors.grey : theme.colors.blue,
            },
          ]}
          placeholderStyle={styles.placeholderStyle}
          placeholder={getLocalText('LoginSignup.chooseCity')}
          selectedTextStyle={styles.selectedTextStyle}
          data={getCityData}
          onChange={(item) => {
            this.setState({getSelectedCities: item});
            this.getTeams(item?.value);
          }}
          value={getSelectedCities}
          iconColor={
            getSelectedCities === '' ? theme.colors.grey : theme.colors.blue
          }
          disable={cityDisable}
          itemTextStyle={{color: theme.colors.grey2}}
          containerStyle={{borderRadius: scale(10)}}
          labelField="label"
          valueField="value"
        />

        <FlatList
          contentContainerStyle={styles.listContainer}
          data={teamData}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          extraData={this.state}
          keyExtractor={(item) => {
            return item?.id;
          }}
          renderItem={this.renderItem}
          style={styles.listView}
          onEndReachedThreshold={0.5}
          ListFooterComponent={this.renderFooter}
          onEndReached={this.loadMore}
        />
        <Label
          title={getLocalText('LoginSignup.signupInfo2')}
          style={styles.notice}
        />
        <Button
          onPress={() => {
            this.setState({cityPopup: !this.state.cityPopup});
          }}
          style={{
            backgroundColor:
              selectedId !== '' ? theme.colors.blue : theme.colors.grey,
            marginBottom: scale(23),
          }}
          title={getLocalText('LoginSignup.createAccount')}
        />
        <Loader loading={this.state.loadding} />

        {this.state.errorAlert ? (
          <ErrorBox
            loadding={this.state.errorAlert}
            error={this.state.alertErr}
            close={this.handleAlert}
          />
        ) : null}
        <ChooseCityPopup
          isVisible={cityPopup}
          title={getLocalText('Information.titletext')}
          description={getLocalText('Information.citypopuptext')}
          close={this.handleChooseCityPopup}
          onPressSubmit={this.handleSignup}
          onPressCancel={this.onPressCancel}
          cityName={cityName}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    marginLeft: scale(30),
    marginTop: scale(20),
    marginBottom: scale(10),
  },
  subTitle: {
    marginLeft: scale(30),
    marginTop: scale(5),
    marginBottom: scale(10),
  },
  listContainer: {
    alignItems: 'flex-start',
    paddingBottom: scale(10),
  },
  card: {
    backgroundColor: theme.colors.white,
    height: theme.SCREENWIDTH / 2 - scale(37),
    width: theme.SCREENWIDTH / 2 - scale(37),
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: 0.8,
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
  notice: {
    marginLeft: scale(30),
    marginTop: scale(10),
    marginBottom: scale(10),
    fontSize: scale(11),
  },
  searchView: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: 1,
    width: '85%',
    height: scale(50),
    borderRadius: scale(20),
    alignItems: 'center',
    paddingVertical: scale(5),
    paddingHorizontal: scale(10),
    marginLeft: scale(30),
    marginTop: scale(20),
    color: theme.colors.black,
  },
  selectedTextStyle: {
    fontSize: scale(13),
    color: theme.colors.blue,
  },
  checkImage: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  listView: {
    marginTop: scale(15),
    marginLeft: scale(30),
    width: '82%',
  },
  placeholderStyle: {
    fontSize: scale(12),
    color: theme.colors.grey,
  },
});

const mapStateToProps = (state) => ({
  loginstatus: state.AppReducer.loginstatus,
  userInfo: state.UserInfo,
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

export default connect(mapStateToProps, mapDispatchToProps)(Signup4);
