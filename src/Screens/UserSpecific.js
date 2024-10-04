import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import Svg, {Line} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Label,
  ScreenContainer,
  GroupCard,
  VideoShow,
  FullMediaModel,
  Button,
  BackgroundChunk,
  OfflineModel,
} from '../Components';
import {theme, scale, images, Api, Config} from '../Utils';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import {getGroups, getJoinedGroups} from '../Redux/Actions';
import {checkValidUrl} from '../Utils/helper';
import {FreindStatus, SCREEN_TYPE} from '../Utils/StaticData';
import {Badge1, Badge2, Badge3, MessageIcon} from '../Assets/SVGs';

let loadMoreJoinedGroup = false;
class UserSpecific extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      isMoreContent: false,
      enableScrollViewScroll: true,
      isProfileActive: 0,
      userProfileId:
        this.props?.route?.params?.screenName === SCREEN_TYPE.NEW_USER
          ? this.props?.route?.params?.id
          : this.props.route?.params?.data?.id,
      data: this.props.route?.params?.data || this.props?.route?.params?.id,

      isNewUser:
        this.props?.route?.params?.screenName === SCREEN_TYPE.NEW_USER
          ? true
          : false,
      statusData: [
        // {name: 'Post.like', icon: 'thumbs-up', point: 10},
        // {name: 'Post.comment', icon: 'message-square', point: 60},
        // {name: 'Post.share', icon: 'corner-right-up', point: 30},
      ],
      postMedias: [],
      imagesData: [],
      BadgesData: [{image: Badge1}, {image: Badge2}, {image: Badge3}],
      isPaused: true,
      userInfo: '',
      postLike: 0,
      postComment: 0,
      postShare: 0,
      total: '',
      percentage: 0,
      rank: '',
      color: '',
      userImage: '',
      fullScreenMedia: false,
      toggleMenu: false,
      tabs: [
        {
          id: 0,
          title: getLocalText('UserData.group'),
        },
        {
          id: 1,
          title: getLocalText('Settings.profile'),
        },
        {
          id: 2,
          title: getLocalText('Timeline.friend'),
        },
      ],
      friends: [],
      groupsData: [],
      groupdataloading: false,
      loadmore: false,
      page: 1,
      totalPage: 1,
      refreshing: false,
      userCoverPic: '',
      verified: 0,
      counts: '',
      friendreqSend: false,
      changeReqestSatus: false,
      disabledButton: false,
      isDataLaoding: false,
    };
  }

  componentDidMount() {
    this.initSetup();
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', async () => {
      this.initSetup();
    });
  }

  async initSetup() {
    this.setState({isDataLaoding: true});
    try {
      let userSpecId =
        this.props?.route?.params?.screenName === SCREEN_TYPE.NEW_USER
          ? this.props?.route?.params?.id
          : this.props.route?.params?.data?.id;
      this.setState({
        userProfileId: userSpecId,
      });
      this.userDetails();
      this.getGroupList();
      this.getFriends();
      this.getUserPostsMedia();
      this._unsubscribe = this.props.navigation.addListener(
        'focus',
        async () => {
          if (
            this.props.route.params &&
            this.props.route.params.userSpefific === true
          ) {
            this.props.navigation.setParams({userSpefific: undefined});
          }
        },
      );
      this.setState({isDataLaoding: false});
    } catch (error) {
      this.setState({isDataLaoding: false});
    }
  }

  //login user all frnds
  getFriends = async () => {
    let userSpecId =
      this.props?.route?.params?.screenName === SCREEN_TYPE.NEW_USER
        ? this.props?.route?.params?.id
        : this.props.route?.params?.data?.id;
    try {
      let response = await getAPICall(API.friendList + '/' + userSpecId);
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          let frndList = data === 'No friends' ? [] : data;
          this.setState({friends: frndList});
        }
      }
    } catch (error) {}
  };

  componentWillUnmount() {
    this.focusListener();
    this._unsubscribe();
  }

  userDetails = async (id) => {
    let userSpecId =
      this.props?.route?.params?.screenName === SCREEN_TYPE.NEW_USER
        ? this.props?.route?.params?.id
        : this.props.route?.params?.data?.id;
    try {
      let response = await getAPICall(API.user + userSpecId);
      let userTeamImage = await AsyncStorage.getItem('@userTeamData');
      this.setState({userCoverPic: userTeamImage});
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          let countData = data?.counts;
          let countDatas = [
            {
              name: getLocalText('Post.post'),
              icon: 'disc',
              count: countData?.POST_CREATED_COUNT,
              point: countData?.POST_CREATED_POINT,
            },
            {
              name: getLocalText('Post.imagepost'),
              icon: 'instagram',
              count: countData?.POST_CREATED_IMAGE_COUNT,
              point: countData?.POST_CREATED_IMAGE_POINT,
            },
            {
              name: getLocalText('Post.videopost'),
              icon: 'video',
              count: countData?.POST_CREATED_VIDEO_COUNT,
              point: countData?.POST_CREATED_VIDEO_POINT,
            },
            {
              name: getLocalText('Post.like'),
              icon: 'thumbs-up',
              count: countData?.POST_LIKED_COUNT,
              point: countData?.POST_LIKED_POINT,
            },

            {
              name: getLocalText('Post.comment'),
              icon: 'message-square',
              count: countData?.POST_COMMENT_COUNT,
              point: countData?.POST_COMMENT_POINT,
            },
            {
              name: getLocalText('Post.share'),
              icon: 'corner-right-up',
              count: countData?.POST_SHARED_COUNT,
              point: countData?.POST_SHARED_POINT,
            },
            {
              name: getLocalText('Post.sponsorpost'),
              icon: 'activity',
              count: countData?.SPONSORED_POST_CREATED_COUNT,
              point: countData?.SPONSORED_POST_CREATED_POINT,
            },
            {
              name:
                getLocalText('Post.sponsorpost') + getLocalText('Post.like'),
              icon: 'thumbs-up',
              count: countData?.SPONSORED_POST_LIKED_COUNT,
              point: countData?.SPONSORED_POST_LIKED_POINT,
            },
            {
              name:
                getLocalText('Post.sponsorpost') + getLocalText('Post.comment'),
              icon: 'message-square',
              count: countData?.SPONSORED_POST_COMMENT_COUNT,
              point: countData?.SPONSORED_POST_COMMENT_POINT,
            },
            {
              name:
                getLocalText('Post.sponsorpost') + getLocalText('Post.share'),
              icon: 'corner-right-up',
              count: countData?.SPONSORED_POST_SHARED_COUNT,
              point: countData?.SPONSORED_POST_SHARED_POINT,
            },
            {
              name: getLocalText('Timeline.audio'),
              icon: 'mic',
              count: countData?.AUDIO_ROOM_PARTICIPATION_COUNT,
              point: countData?.AUDIO_ROOM_PARTICIPATION_POINT,
            },
          ];
          this.setState({
            userInfo: data,
            isProfileActive: data?.friend === 0 ? 1 : 0,
            postLike: response.data.counts.POST_LIKED_COUNT,
            postComment: response.data.counts.POST_COMMENT_COUNT,
            postShare: response.data.counts.POST_SHARED_COUNT,
            userImage: {uri: data.user_pic, mediaType: 'image'},
            userCoverPic: data?.cover_pic?.optimize,
            total: response.data.counts.rank?.totalPoints,
            verified: data?.is_verified,
            counts: data?.counts,
            statusData: countDatas,
          });
        }
        this.setState({data: response.data});
      }
      // await this.handlePercantage(this.state.total);
    } catch (error) {}
  };

  handleTabButton = (index) => {
    this.setState({isProfileActive: index});
  };

  getGroupList = async () => {
    this.setState({groupdataloading: true});
    await this.props.getJoinedGroups(1);
    await this.setState({
      groupsData: this.props.getJoinedGroupsList,
      totalPage: this.props.getJoinedGroupsT_Page,
      groupdataloading: false,
    });
  };

  getUserPostsMedia = async () => {
    try {
      let response = await getAPICall(
        API.postsMedia + this.state.userProfileId,
      );
      if (response.error) {
      } else {
        let data = response.data;
        await this.setState({
          imagesData: data.image?.slice(0, 6),
          postMedias: data.video?.slice(0, 1),
        });
      }
    } catch (error) {}
  };
  handleClose = () => {
    this.setState({fullScreenMedia: false});
  };
  renderGroups = ({item, index}) => {
    return (
      this.state.userInfo?.friend === 3 && (
        <GroupCard
          item={item}
          index={index}
          onPress={(d, i) =>
            this.props.navigation.navigate('GroupDetails', {
              item: {groupData: item, joined: true},
            })
          }
          onPressNotification={this.handleNotification}
          onPressGroup={this.handlegroupPress}
          onPressImage={() =>
            this.props.navigation.navigate('GroupMember', {
              groupData: item,
            })
          }
        />
      )
    );
  };
  handlegroupPress = () => {};
  handlememberPress = () => {};
  handleNotification = async ({item, index}) => {
    await this.props.manageNotification(item?.id);
    if (this.props.notification) {
      this.state.groupsData[index].is_notification =
        !this.state.groupsData[index].is_notification;
      this.setState({groupsData: this.state.groupsData});
    } else {
      Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
    }
  };

  renderProfiles = () => {
    const {imagesData, postMedias} = this.state;
    return (
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={{paddingBottom: scale(15)}}>
          {this.state.userInfo.about_user && (
            <View
              style={[
                styles.aboutUsContainer,
                externalStyle.shadow,
                {paddingVertical: scale(8), paddingHorizontal: scale(20)},
              ]}>
              <Text style={styles.aboutuser}>
                {this.state?.userInfo.about_user}
              </Text>
            </View>
          )}

          {postMedias !== undefined && postMedias[0]?.url.length > 0 && (
            <VideoShow
              url={postMedias[0]?.url}
              style={[styles.card, externalStyle.shadow, styles.videoStyle]}
              videoStyle={{borderRadius: scale(18)}}
              isPaused={this.state.isPaused}
              handleMuteVideo={() =>
                this.setState({isPaused: !this.state.isPaused})
              }
            />
          )}
          {imagesData !== undefined && imagesData?.length > 0 && (
            <View
              style={[styles.card, externalStyle.shadow, styles.imagesView]}>
              {imagesData !== undefined && imagesData.length > 0 ? (
                imagesData.map((d, i) => {
                  return (
                    <FastImage
                      key={i.toString()}
                      source={d.url.small ? {uri: d.url.small} : images.AppLogo}
                      style={[styles?.image]}
                    />
                  );
                })
              ) : (
                <Label title={getLocalText('ErrorMsgs.noPostMedia')} />
              )}
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  //load next page posts
  loadMore = async () => {
    if (this.props.getJoinedGroupsList) {
      if (
        this.state.page <= this.props.getJoinedGroupsList.total_page &&
        !loadMoreJoinedGroup
      ) {
        let page = this.state.page + 1;
        if (page < this.props.getJoinedGroupsList.total_page) {
          this.setState({loadmore: true});
          loadMoreJoinedGroup = true;
          await this.props.getJoinedGroups(page);
          let data = [
            ...this.state.groupsData,
            ...this.props.getJoinedGroupsList.data,
          ];
          this.setState({
            loadmore: false,
            groupsData: data,
            page: page,
          });
          loadMoreJoinedGroup = false;
        }
      } else {
        this.setState({loadmore: false});
      }
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
          style={{marginTop: scale(-20)}}
        />
      );
    }
  };

  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});
    await this.props.getGroups();
    await this.setState({
      groupsData: this.props.getJoinedGroupsList.data,
      refreshing: false,
    });
  };

  onPresstoChat = async (item) => {
    const userID = item?.recipient_id;
    let chatResponse = await getAPICall(API.chat + userID);
    this.props.navigation.navigate('Chat', {
      data: chatResponse.data,
      singleChat: '1',
    });
  };

  onPressProfile = async (item, index) => {
    this.redirectToUserDetails(item, item?.recipient_id);
  };

  redirectToUserDetails = async (item, userId) => {
    var id = '';
    if (this.props.userDetails?.id === item?.recipient_id) {
      id = item?.sender_id;
    } else {
      id = item?.recipient_id;
    }
    this.props.navigation.push('UserDataSpecific', {
      data: id === '' ? item : id,
      id: id,
      screenName: SCREEN_TYPE.NEW_USER,
      type: '1',
    });
  };

  //user friends lists
  renderFriends = ({item, index}) => {
    return (
      <View style={styles.userView} key={index}>
        <TouchableOpacity
          style={styles.userView}
          onPress={() => {
            this.onPressProfile(item);
          }}>
          <FastImage
            source={{
              uri:
                item?.recipient_id === this.state.userProfileId
                  ? item?.sender_image?.small || item?.sender_image?.optimize
                  : item?.recipient_image?.small ||
                    item?.recipient_image?.optimize,
            }}
            style={styles.userPic}
          />
          <Label
            title={
              item?.recipient_id === this.state.userProfileId
                ? item?.sender_name
                : item?.recipient_name
            }
            style={{
              marginLeft: scale(13),
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.subView}
          onPress={() => {
            this.onPresstoChat(item);
          }}>
          <MessageIcon height={scale(22)} width={scale(22)} />
        </TouchableOpacity>
      </View>
    );
  };

  //send Friend Reqest
  handleSendFriendRequest = async () => {
    // if (!this.state.friendreqSend) {
    let userId = this.state.userProfileId;
    let login_userId = this.props.userData.id;
    this.setState({friendreqSend: true, disabledButton: true});
    if (userId !== login_userId) {
      try {
        let reqestSendResponse = await getAPICall(API.sendFriendReq + userId);
        if (reqestSendResponse.success) {
          this.userDetails(userId);
          this.setState({friendreqSend: true, disabledButton: false});

          Alert.alert(reqestSendResponse.message);
          this.setState({changeReqestSatus: true});
        } else {
          this.userDetails(userId);
        }
      } catch (error) {}
      // }
    }
  };

  //undo Friend req
  undoFrnd = async () => {
    let userId = this.state.userProfileId;
    let login_userId = this.props.userData.id;
    this.setState({disabledButton: true});
    if (userId !== login_userId) {
      try {
        let reqestSendResponse = await getAPICall(API.undoReq + userId);
        if (reqestSendResponse.success) {
          this.userDetails(userId);
          this.setState({disabledButton: false});
          Alert.alert(reqestSendResponse.message);
        } else {
        }
      } catch (error) {
        this.setState({disabledButton: false});
      }
    }
  };

  handeReceivedRequest = async () => {
    let requestUpdate = new FormData();
    requestUpdate.append('user_id', this.state.userProfileId);
    requestUpdate.append('status', 'accepted');
    try {
      let userRequest = await postAPICall(
        API.friendrequestUpdate,
        requestUpdate,
      );
      if (userRequest.error) {
        Alert.alert(userRequest.errorMsg);
      } else {
        Alert.alert(userRequest.message);
        // this.getFriends();
        this.setState({changeReqestSatus: true});
      }
    } catch (error) {}
  };

  handleBackPress = () => {
    const {type} = this.props?.route?.params;
    if (type === '1' || type === '2') {
      this.props.navigation.goBack();
      // } else if (type === '2') {
      // this.props.navigation.navigate('GroupMember', {groupData: ''});
    } else {
      this.props.navigation.replace('Tabs');
    }
  };

  render() {
    const {
      isMoreContent,
      statusData,
      isProfileActive,
      total,
      groupsData,
      groupdataloading,
      tabs,
      friends,
      userCoverPic,
      userInfo,
      disabledButton,
    } = this.state;
    let name =
      this.state.userInfo?.first_name !== undefined
        ? this.state.userInfo?.first_name.length
        : 0;
    let last =
      name === 0 ? '' : this.state.userInfo?.first_name.charAt(name - 1);
    return (
      <ScreenContainer>
        <OfflineModel />
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />

        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => {
            // type === '1'
            //   ? this.props.navigation.goBack()
            //   : this.props.navigation.replace('Tabs');
            this.handleBackPress();
          }}>
          <Icon1
            name="arrow-back"
            size={scale(22)}
            color={theme.colors.black}
          />
        </TouchableOpacity>
        <View style={styles.headerImageView}>
          <FastImage
            // blurRadius={1.5}
            source={
              !checkValidUrl(userCoverPic)
                ? images.profilepick
                : {uri: userCoverPic}
            }
            style={styles.headerImage}
            // resizeMode={FastImage.resizeMode.cover}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            this.setState({fullScreenMedia: true});
          }}>
          <FastImage
            source={
              !checkValidUrl(userInfo?.user_pic?.optimize)
                ? images.defaultUser
                : {uri: userInfo?.user_pic?.optimize}
            }
            style={styles.userImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        {this.state.userInfo.first_name && (
          <>
            <View style={styles.nameCon}>
              <Text style={styles.name}>
                {!this.state.userInfo ||
                this.state.userInfo.first_name === undefined
                  ? ''
                  : this.state.userInfo.first_name}
              </Text>
              {this.state.verified === 1 && (
                <Icon2
                  name={'checkcircle'}
                  style={{marginLeft: scale(10)}}
                  size={scale(18)}
                  color={theme.colors.blue}
                />
              )}
            </View>
            {this.props.userData.id !== this.state.userInfo.id && (
              <View style={{elevation: scale(0)}}>
                <Button
                  BtnIcon={
                    this.state.userInfo?.friend === FreindStatus.REQEST_SENT
                      ? 'user-minus'
                      : this.state.userInfo?.friend ===
                        FreindStatus.REQEST_RECEIVED
                      ? 'user-check'
                      : this.state.userInfo?.friend ===
                        FreindStatus.REQEST_CONFIR
                      ? 'check'
                      : 'user-plus'
                  }
                  disabled={disabledButton}
                  style={{width: '45%'}}
                  title={
                    this.state.userInfo?.friend === FreindStatus.REQEST_SENT
                      ? getLocalText('Information.cancelbtn')
                      : this.state.userInfo?.friend ===
                        FreindStatus.REQEST_RECEIVED
                      ? getLocalText('Information.cancelbtn')
                      : this.state.userInfo?.friend ===
                        FreindStatus.REQEST_CONFIR
                      ? getLocalText('Information.friend')
                      : `${getLocalText('UserData.add')} ${
                          this.state.userInfo.first_name
                        }`
                  }
                  onPress={() => {
                    if (
                      this.state.userInfo?.friend ===
                      FreindStatus.REQEST_RECEIVED
                      // !changeReqestSatus
                    ) {
                      this.handeReceivedRequest();
                    } else if (
                      this.state.userInfo?.friend === FreindStatus.NOTHING
                      // !changeReqestSatus
                    ) {
                      this.handleSendFriendRequest();
                    } else if (
                      this.state.userInfo?.friend === FreindStatus.REQEST_SENT
                    ) {
                      this.undoFrnd();
                    }
                  }}
                />
              </View>
            )}
          </>
        )}
        <ScrollView style={{height: theme.SCREENHEIGHT}}>
          <View
            style={[externalStyle.shadow, styles.card]}
            onStartShouldSetResponderCapture={() => {
              this.setState({enableScrollViewScroll: true});
            }}>
            <View style={styles.cardView}>
              {total !== '' && (
                <>
                  <FastImage
                    source={{uri: this.state.userInfo?.rank?.image}}
                    style={{
                      height: scale(40),
                      width: scale(40),
                      borderRadius: scale(20),
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <View style={styles.rankView}>
                    <View style={styles.rank}>
                      <Text
                        style={[
                          styles.text,
                          {color: this.state.userInfo?.rank?.color},
                        ]}>
                        {/* {getLocalText('UserData.rank')} */}
                        {this.state.userInfo.rank?.name}
                      </Text>
                      <Text
                        style={[
                          styles.text,
                          {color: this.state.userInfo?.rank?.color},
                        ]}>
                        {this.state?.counts?.totalPoints} Jul
                      </Text>
                    </View>
                    <View style={styles.outerProgress}>
                      <View
                        style={[
                          styles.innnerProgess,
                          {
                            backgroundColor: this.state.userInfo?.rank?.color,
                            width: this.state.userInfo?.rank?.percentage,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </>
              )}
            </View>
            {isMoreContent ? (
              <>
                <Label
                  title={getLocalText('UserData.scoreboardTitle')}
                  style={styles.text1}
                />
                <View style={[externalStyle.shadow, styles.statusView]}>
                  {statusData.map((d, i) => {
                    return (
                      <View
                        key={i.toString()}
                        style={[styles.cardView, {marginVertical: scale(7)}]}>
                        <Icon
                          name={d?.icon}
                          size={scale(16)}
                          color={theme.colors.blue}
                        />
                        <Text style={styles.textStats}>
                          {`${d?.name} (${d?.count})`}
                        </Text>
                        <Svg height={1} style={styles.flex}>
                          <Line
                            stroke={theme.colors.grey13}
                            strokeDasharray="4, 3"
                            x1="0"
                            y1="0"
                            x2={theme.SCREENWIDTH / 2}
                            y2={'0'}
                          />
                        </Svg>
                        <Text
                          style={[
                            styles.textStats,
                            {
                              color: theme.colors.black,
                              marginRight: scale(0),
                              fontFamily: theme.fonts.muktaMedium,
                            },
                          ]}>
                          {`${d?.point} Jul`}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : null}

            <TouchableOpacity
              onPress={() =>
                this.setState({isMoreContent: !this.state.isMoreContent})
              }
              style={styles.downIcon}>
              <Icon
                name={isMoreContent ? 'chevron-up' : 'chevron-down'}
                size={scale(25)}
                color={
                  isMoreContent ? theme.colors.blue : theme.colors.darkGrey
                }
              />
            </TouchableOpacity>
          </View>
          <View style={styles.fillterCon}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: scale(18)}}>
              {tabs.map((data, index) => {
                return index === 2 && friends.length === 0 ? (
                  <View />
                ) : index === 0 && this.state.userInfo?.friend === 0 ? (
                  <View />
                ) : (
                  this.state.userInfo.first_name && (
                    <TouchableOpacity
                      key={index.toString()}
                      onPress={() => this.handleTabButton(data.id)}
                      style={[
                        styles.fillterbtn,
                        externalStyle.shadow,
                        {
                          backgroundColor:
                            data.id === this.state.isProfileActive
                              ? theme.colors.white
                              : theme.colors.grey14,
                        },
                      ]}>
                      {index === 0 ? (
                        <Label
                          title={
                            !this.state.userInfo ||
                            this.state.userInfo.first_name === undefined
                              ? ' '
                              : last === 's'
                              ? this.state.userInfo.first_name +
                                "' " +
                                getLocalText('UserData.group') +
                                ` (${groupsData?.length})`
                              : this.state.userInfo.first_name +
                                "'s " +
                                getLocalText('UserData.group') +
                                ` (${groupsData?.length})`
                          }
                          style={{color: theme.colors.blue}}
                        />
                      ) : index === 2 ? (
                        <Label
                          title={data.title + ' ' + friends.length}
                          style={{color: theme.colors.blue}}
                        />
                      ) : (
                        <Label
                          title={data.title}
                          style={{color: theme.colors.blue}}
                        />
                      )}
                    </TouchableOpacity>
                  )
                );
              })}
            </ScrollView>
          </View>
          {isProfileActive === 0 ? (
            <FlatList
              data={groupsData}
              extraData={[this.state, this.props]}
              keyExtractor={(_, index) => index.toString()}
              renderItem={this.renderGroups}
              contentContainerStyle={{
                paddingHorizontal: scale(23),
                paddingBottom: scale(10),
              }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              ListFooterComponent={this.renderFooter.bind(this)}
              onEndReachedThreshold={0.3}
              onEndReached={this.loadMore}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.handleRefresh}
                />
              }
              ListEmptyComponent={() => (
                <View style={styles.loaddingCon}>
                  {groupdataloading ? (
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.blue}
                      style={styles.center}
                    />
                  ) : (
                    Config.NO_DATA_COMPO(groupdataloading)
                  )}
                </View>
              )}
            />
          ) : isProfileActive === 1 ? (
            this.renderProfiles()
          ) : (
            <FlatList
              data={friends}
              extraData={this.state}
              keyExtractor={(_, index) => index.toString()}
              renderItem={this.renderFriends}
              contentContainerStyle={styles.containerView}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={this.renderFooter.bind(this)}
              onEndReachedThreshold={0.3}
              onEndReached={this.loadMore}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.handleRefresh}
                />
              }
            />
          )}

          <FullMediaModel
            isShow={this.state.fullScreenMedia}
            closeModel={this.handleClose}
            postImages={this.state.userImage}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  headerImageView: {
    height: isIphoneX()
      ? theme.SCREENHEIGHT * 0.15 + scale(20)
      : theme.SCREENHEIGHT * 0.15,
    overflow: 'hidden',
  },
  backIcon: {
    position: 'absolute',
    zIndex: 11,
    top: Platform.OS === 'ios' ? theme.SCREENHEIGHT * 0.05 : 0,
    marginLeft: scale(15),
  },
  headerImage: {
    width: theme.SCREENWIDTH,
    height: isIphoneX()
      ? theme.SCREENHEIGHT * 0.15 + scale(20)
      : theme.SCREENHEIGHT * 0.15,
    resizeMode: 'cover',
  },
  userImage: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    alignSelf: 'center',
    marginTop: -scale(60),
  },
  name: {
    textAlign: 'center',
    marginTop: scale(5),
    fontFamily: theme.fonts.muktaBold,
    color: theme.colors.grey2,
    fontSize: scale(16),
    marginLeft: scale(5),
  },
  card: {
    backgroundColor: theme.colors.white,
    marginVertical: scale(16),
    marginHorizontal: scale(18),
    borderRadius: scale(18),
    padding: scale(13),
    paddingBottom: scale(5),
  },
  nameCon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesView: {
    padding: scale(15),
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: scale(15),
  },
  image: {
    width: theme.SCREENWIDTH * 0.252,
    height: scale(100),
    margin: '1%',
    aspectRatio: 1,
    borderRadius: scale(9),
  },
  videoStyle: {
    padding: scale(15),
    paddingBottom: scale(15),
    height: theme.SCREENHEIGHT / 3.7,
    marginVertical: scale(0),
  },
  statusView: {
    backgroundColor: theme.colors.white,
    borderRadius: scale(8),
    shadowRadius: scale(10),
    marginHorizontal: scale(5),
    padding: scale(9),
  },
  cardView: {flexDirection: 'row', alignItems: 'center'},
  rankView: {marginLeft: scale(17), flex: 1, marginRight: scale(10)},
  text: {
    color: theme.colors.red1,
    fontFamily: theme.fonts.muktaBold,
    fontSize: scale(16),
  },
  rank: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outerProgress: {
    marginTop: scale(6),
    backgroundColor: theme.colors.grey9,
    borderRadius: scale(10),
    height: scale(5),
  },
  innnerProgess: {
    backgroundColor: theme.colors.red1,
    borderRadius: scale(10),
    height: scale(5),
    width: '50%',
  },
  downIcon: {alignSelf: 'center', padding: scale(5)},
  text1: {marginTop: scale(9), marginBottom: scale(14), fontSize: scale(12)},
  textStats: {
    color: theme.colors.grey12,
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    marginHorizontal: scale(12),
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT / 3,
  },
  fillterCon: {
    marginVertical: scale(15),
    justifyContent: 'space-around',
  },
  fillterbtn: {
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(11),
    borderRadius: scale(20),
  },
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  userPic: {
    height: scale(50),
    width: scale(50),
    resizeMode: 'cover',
    borderRadius: scale(25),
  },
  containerView: {
    paddingHorizontal: scale(23),
    paddingBottom: scale(10),
    paddingTop: scale(15),
  },
  subView: {
    position: 'absolute',
    right: scale(10),
    padding: scale(3),
  },
  aboutuser: {
    fontFamily: theme.fonts.muktaVaaniLight,
    color: theme.colors.grey2,
    fontSize: scale(14),
    textAlignVertical: 'center',
    alignItems: 'center',
  },
  aboutUsContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: scale(18),
    borderRadius: scale(15),
    justifyContent: 'center',
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.31),
    right: -(theme.SCREENHEIGHT * 0.39),
    transform: [{rotate: '75deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.47),
    left: -(theme.SCREENHEIGHT * 0.36),
    transform: [{rotate: '75deg'}],
  },
});

const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  const groupCount = state.UserInfo.joinGroupCount;
  const groupList = state.groupsReducer.group_list;
  const getJoinedGroupsList = state.groupsReducer.joinGroup_list;
  const getJoinedGroupsT_Page = state.groupsReducer.joinGroupTotalPage;
  return {
    userData,
    groupList,
    getJoinedGroupsList,
    groupCount,
    getJoinedGroupsT_Page,
  };
};
export default connect(mapStateToProps, {getGroups, getJoinedGroups})(
  UserSpecific,
);
