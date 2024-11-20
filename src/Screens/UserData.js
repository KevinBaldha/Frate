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
  TouchableNativeFeedback,
  TextInput,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon1 from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import Svg, {Line} from 'react-native-svg';
import {
  Label,
  ScreenContainer,
  GroupCard,
  VideoShow,
  FullMediaModel,
  Menus,
  FullImageModel,
  Loader,
  ConfirmationModel,
  PopUpModel,
  OfflineModel,
} from '../Components';
import {Badge1, Badge2, Badge3, MessageIcon} from '../Assets/SVGs';
import {theme, scale, images, Api, Config} from '../Utils';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {API, deleteAPICall, getAPICall, postAPICall} from '../Utils/appApi';
import {
  getGroups,
  getJoinedGroups,
  manageNotification,
  exitGroup,
  getJoinGroupCount,
  userData,
  CreatedGroupCount,
} from '../Redux/Actions';
import {checkValidUrl} from '../Utils/helper';
import {SCREEN_TYPE} from '../Utils/StaticData';

const optionsData = [
  {icon: 'info', name: getLocalText('Chat.groupinfo')},
  {icon: 'bell', name: getLocalText('Chat.notification')},
  {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
  {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
];
const optionsData1 = [
  {icon: 'info', name: getLocalText('Chat.groupinfo')},
  {icon: 'bell', name: getLocalText('Chat.notification')},
  {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
  // {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
  {icon: 'delete-outline', name: getLocalText('GroupInfo.delete')},
];

let loadMoreJoinedGroup = false;

class UserData extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      isMoreContent: false,
      enableScrollViewScroll: true,
      isProfileActive: 0,
      indicatorOffset: 0,
      verified: 0,
      statusData: [],
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
      deleteModel: false,
      leaveGroup: false,
      groupSelectedId: null,
      selectedGroup: '',
      attachImages: [],
      option: [
        {id: 0, name: getLocalText('UserData.savepost'), icon: 'bookmark'},
        {id: 1, name: getLocalText('UserData.interaction'), icon: 'star'},
        // {id: 2, name: getLocalText('UserData.block'), icon: 'block-helper'},
        {id: 3, name: getLocalText('UserData.friendlist'), icon: 'users'},
      ],
      tabs: [
        {
          id: 0,
          title: "'s " + getLocalText('UserData.group'),
        },
        {
          id: 1,
          title: "'s " + getLocalText('Settings.profile'),
        },
        {
          id: 2,
          title: "'s " + getLocalText('Timeline.friend'),
        },
      ],
      groupsData: [],
      groupdataloading: false,
      loadmore: false,
      page: 1,
      totalPage: 1,
      refreshing: false,
      gallrayView: false,
      gallrayindex: 0,
      userCoverPic: '',
      editMode: false,
      aboutUser: '',
      counts: '',
      loadding: false,
      friends: [],
      bodyColor: theme.defaultGradient,
      optionsShow: false,
      groupIndex: null,
      popUpModel: false,
    };
  }

  async componentDidMount() {
    this.getComponentMethod();
  }

  getComponentMethod = () => {
    this.setState({editMode: false});
    this.userDetails();
    this.getGroupList();
    this.getUserPostsMedia();
    this.getFriends();
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', async () => {
      this.setState({editMode: false});
      await this.userDetails();
      await this.getGroupList();
      await this.getUserPostsMedia();
      await this.getFriends();
    });
  };

  //login user all frnds
  getFriends = async () => {
    try {
      let response = await getAPICall(
        API.friendList + '/' + this.props.userDetails?.id,
      );
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({friends: data === 'No friends' ? '' : data});
        }
      }
    } catch (error) {}
  };

  componentWillUnmount() {
    this.focusListener();
  }

  userDetails = async () => {
    try {
      let response = await getAPICall(API.user + this.props.userDetails?.id);
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
                getLocalText('Post.sponsorpost') +
                ' ' +
                getLocalText('Post.like'),
              icon: 'thumbs-up',
              count: countData?.SPONSORED_POST_LIKED_COUNT,
              point: countData?.SPONSORED_POST_LIKED_POINT,
            },
            {
              name:
                getLocalText('Post.sponsorpost') +
                ' ' +
                getLocalText('Post.comment'),
              icon: 'message-square',
              count: countData?.SPONSORED_POST_COMMENT_COUNT,
              point: countData?.SPONSORED_POST_COMMENT_POINT,
            },
            {
              name:
                getLocalText('Post.sponsorpost') +
                ' ' +
                getLocalText('Post.share'),
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
            postLike: response.data.counts.POST_LIKED_COUNT,
            postComment: response.data.counts.POST_COMMENT_COUNT,
            postShare: response.data.counts.POST_SHARED_COUNT,
            userImage: {uri: data.user_pic, mediaType: 'image'},
            total: response.data.counts.totalPoints,
            userCoverPic: response?.data.cover_pic?.original,
            varified: data?.is_verified,
            aboutUser: data?.about_user,
            statusData: countDatas,
            bodyColor: data?.color,
          });
          this.props.getJoinGroupCount(data.group_count);
        }
        this.setState({data: response.data});
      }
      // await this.handlePercantage(this.state.total);
    } catch (error) {}
  };

  handleTabButton = index => {
    this.setState({editMode: false});
    this.setState({isProfileActive: index});
  };

  getGroupList = async () => {
    this.setState({groupdataloading: true});
    await this.props.getJoinedGroups(1);
    await this.setState({
      groupsData: this.props.getJoinedGroupsList,
      totalPage: this.props.getJoinedGroupsT_Page,
      page: this.props.getJoinedGroupsC_Page,
      groupdataloading: false,
    });
  };

  toggleFilterModal = () => {
    this.setState({isFilterModal: !this.state.isFilterModal});
  };

  getUserPostsMedia = async () => {
    try {
      let response = await getAPICall(
        API.postsMedia + this.props.userDetails?.id,
      );

      if (response.error) {
      } else {
        let data = response.data;
        await this.setState({
          imagesData: data.image,
          postMedias: data.video,
        });
      }
    } catch (error) {}
  };

  handleClose = () => {
    this.setState({fullScreenMedia: false});
  };

  renderGroups = ({item, index}) => {
    return (
      <GroupCard
        item={item}
        index={index}
        onPress={() => {
          this.props.navigation.navigate('GroupDetails', {
            item: {groupData: item, joined: true},
          });
        }}
        onPressNotification={this.handleNotification}
        onPressGroup={this.onPressGroup}
        onPressImage={this.onPressImage}
        isShowTime={true}
        options
        notificatoionIconShow={true}
        onPressOptions={evt => this.handleMoreVerticalGroup(evt, item, index)}
      />
    );
  };

  handleMoreVerticalGroup = (evt, item, index) => {
    this.setState({
      optionsShow: !this.state.optionsShow,
      groupIndex: index,
      groupSelectedId: item?.id,
      indicatorOffset: evt.nativeEvent.pageY,
    });
  };

  closeMoreOptions = () => {
    this.setState({
      optionsShow: false,
      groupIndex: null,
      groupSelectedId: null,
    });
  };
  handlePopUpModel = () => {
    this.setState({popUpModel: !this.state.popUpModel});
  };

  onPressGroup = (item, index) => {
    this.props.navigation.navigate('GroupInformation', {
      groupData: item,
      mediaPost: '2',
    });
  };
  onPressImage = (item, index) => {
    this.props.navigation.navigate('GroupMember', {groupData: item});
  };
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
  handleMenus = index => {
    this.setState({toggleMenu: !this.state.toggleMenu});
    setTimeout(() => {
      if (index === 0) {
        this.props.navigation.navigate('SavePost');
      } else if (index === 1) {
        this.props.navigation.navigate('Interactions');
      }
      //  else if (index === 2) {
      //   this.props.navigation.navigate('BlockedContent');
      // }
      else if (index === 2) {
        this.props.navigation.navigate('FriendRequestList');
      }
    }, 700);
  };

  handleOptions = (data, index) => {
    let gindex = this.state.groupIndex;
    this.setState({optionsShow: !this.state.optionsShow});
    setTimeout(async () => {
      if (index === 0) {
        this.props.navigation.navigate('GroupInformation', {
          groupData: data,
        });
      } else if (index === 1) {
        // this.handleNotification(data, this.state.groupIndex);
        await this.props.manageNotification(data?.id, gindex);
        if (this.props.notification) {
          this.state.groupsData[gindex].is_notification =
            !this.state.groupsData[gindex].is_notification;
          this.setState({groupsData: this.state.groupsData});
        } else {
          Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
        }
        // this.props.stopNotification(this.props.route.params.item?.groupData?.id);
      } else if (index === 2) {
        this.setState({reportModel: !this.state.reportModel});
      } else if (index === 3) {
        if (this.state.userInfo.id === data.group_admin_id) {
          this.setState({deleteModel: true, selectedGroup: data});
        } else {
          this.setState({leaveGroup: true, selectedGroup: data});
        }
      }
    }, 700);
  };

  exitHandleGroup = action => {
    this.setState({leaveGroup: false});
    let groupId = this.state.selectedGroup.id;
    if (action === 1) {
      this.props.exitGroup(groupId);
      this.props.navigation.navigate('UserData');
    }
  };

  //update about user details
  handleUpdate = async () => {
    this.setState({editMode: !this.state.editMode});
    if (this.state.aboutUser !== this.props.userDetails?.about_user) {
      let userId = this.props.userDetails?.id;
      try {
        let updateUserData = new FormData();
        this.setState({loadding: true});
        updateUserData.append('about_me', this.state.aboutUser);
        const response = await postAPICall(
          API.updateProfile + userId,
          updateUserData,
        );
        if (response.success) {
          // Alert.alert(response.message);
          this.props.userData(response.data.user);
          this.setState({loadding: false});
        } else {
          this.setState({loadding: false});
        }
      } catch (error) {
        this.setState({loadding: false});
        Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
      }
    }
  };

  renderProfiles = () => {
    const {imagesData, postMedias} = this.state;
    return (
      <View style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps={'handled'}
          style={[styles.flex]}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingBottom: scale(15),
          }}>
          <View
            style={[
              styles.card1,
              externalStyle.shadow,
              {
                padding: !this.state.editMode ? scale(8) : scale(0),
                paddingHorizontal: scale(10),
              },
            ]}>
            {this.state.editMode ? (
              <TextInput
                style={styles.aboutContain}
                multiline={true}
                autoFocus={this.state.editMode}
                numberOfLines={5}
                value={this.state.aboutUser}
                textAlignVertical={'top'}
                onChangeText={text => {
                  this.setState({aboutUser: text});
                }}
              />
            ) : (
              <Text style={styles.aboutuser}>
                {this.state.aboutUser === null
                  ? getLocalText('Group.emptyabout')
                  : this.state.aboutUser}
              </Text>
            )}
            <View style={styles.editContainer}>
              <TouchableOpacity
                disabled={
                  this.state.editMode &&
                  !this.state.aboutUser &&
                  this.state.aboutUser === this.props.userDetails?.about_user
                    ? true
                    : false
                }
                onPress={() => {
                  this.state.editMode
                    ? this.handleUpdate()
                    : this.setState({editMode: !this.state.editMode});
                }}>
                <Icon
                  name={this.state.editMode ? 'check' : 'edit-2'}
                  size={this.state.editMode ? scale(20) : scale(18)}
                  color={theme.colors.blue}
                  // style={{alignSelf: 'flex-end'}}
                />
              </TouchableOpacity>
            </View>
          </View>
          {postMedias !== undefined && postMedias[0]?.url?.length > 0 && (
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
              {imagesData !== undefined && imagesData?.length > 0 ? (
                imagesData.slice(0, 6).map((d, i) => {
                  return (
                    <TouchableNativeFeedback
                      onPress={() => {
                        this.handleCloseGallrayView(i);
                      }}>
                      <FastImage
                        key={i.toString()}
                        source={{uri: d.url?.original}}
                        style={[styles.image]}
                      />
                    </TouchableNativeFeedback>
                  );
                })
              ) : (
                <Label title={getLocalText('ErrorMsgs.noPostMedia')} />
              )}
            </View>
          )}
        </ScrollView>
        <FullImageModel
          isShow={this.state.gallrayView}
          index={this.state.gallrayindex}
          closeModel={this.handleClose}
          postImages={imagesData === undefined ? '' : imagesData}
        />
      </View>
    );
  };
  //load next page
  loadMore = async () => {
    if (this.props.getJoinedGroupsList) {
      if (
        this.state.page <= this.props.getJoinedGroupsT_Page &&
        !loadMoreJoinedGroup
      ) {
        let page = this.state.page + 1;
        if (page < this.props.getJoinedGroupsT_Page) {
          this.setState({loadmore: true});
          loadMoreJoinedGroup = true;
          await this.props.getJoinedGroups(page);
          let data = [
            ...this.state.groupsData,
            ...this.props.getJoinedGroupsList,
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
    this.setState({refreshing: true, page: 1, editMode: false});
    await this.userDetails();
    await this.props.getJoinedGroups(1);
    await this.setState({
      groupsData: this.props.getJoinedGroupsList,
      totalPage: this.props.getJoinedGroupsT_Page,
      refreshing: false,
    });
  };
  handleCloseGallrayView = index => {
    this.setState({gallrayView: !this.state.gallrayView, gallrayindex: index});
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
    this.props.navigation.navigate('UserDataSpecific', {
      data: id === '' ? item : id,
      id: id,
      screenName: SCREEN_TYPE.NEW_USER,
      type: '1',
    });
  };

  onPresstoChat = async item => {
    var userID = '';
    if (this.props.userDetails?.id === item?.recipient_id) {
      userID = item?.sender_id;
    } else {
      userID = item?.recipient_id;
    }
    // const userID = item?.recipient_id;
    let chatResponse = await getAPICall(API.chat + userID);
    this.props.navigation.navigate('Chat', {
      data: chatResponse.data,
      singleChat: '1',
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
                item?.recipient_id === this.props.userDetails?.id
                  ? item?.sender_image?.small || item?.sender_image?.optimize
                  : item?.recipient_image?.small ||
                    item?.recipient_image?.optimize, //optimize
            }}
            style={styles.userPic}
          />
          <Label
            title={
              item?.recipient_id === this.props.userDetails?.id
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

  //delete group
  deleteGroup = async data => {
    this.setState({deleteModel: false});
    if (data === 1) {
      let groupId = this.state.selectedGroup?.id;
      try {
        let deleteGroup = await deleteAPICall(API.groupCreate + '/' + groupId);
        if (deleteGroup.success) {
          this.props.CreatedGroupCount(this.props.created_g_count - 1);
          this.props.navigation.goBack();
        } else {
          Alert.alert(deleteGroup);
        }
      } catch (error) {
        Alert.alert(error);
      }
    }
  };

  render() {
    const {
      isMoreContent,
      statusData,
      isProfileActive,
      total,
      toggleMenu,
      option,
      groupsData,
      groupdataloading,
      varified,
      counts,
      friends,
      userInfo,
      tabs,
      popUpModel,
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
        <View style={styles.headerImageView}>
          <View style={styles.btnMenu}>
            <TouchableOpacity
              onPress={() => {
                this.setState({toggleMenu: !toggleMenu});
              }}>
              <Icon
                name={toggleMenu ? 'x' : 'menu'}
                color={theme.colors.blue}
                size={scale(20)}
              />
            </TouchableOpacity>
          </View>
          {checkValidUrl(
            userInfo?.cover_pic?.medium || userInfo?.cover_pic?.optimize,
          ) ? (
            <FastImage
              // blurRadius={0.5}
              source={
                checkValidUrl(userInfo?.cover_pic?.medium)
                  ? {uri: userInfo?.cover_pic?.medium}
                  : {uri: userInfo?.cover_pic?.optimize}
              }
              style={styles.headerImage}
              // resizeMode={FastImage.resizeMode.cover}
            />
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.imagContainer}
          onPress={() => {
            this.setState({fullScreenMedia: true});
          }}>
          <FastImage
            source={
              !checkValidUrl(userInfo.user_pic?.original)
                ? images.profilepick
                : {uri: userInfo.user_pic?.original}
            }
            style={[styles.userImage, {zIndex: 111}]}
            onError={e => {
              e.target.onerror = null;
              e.target.source = images.user1;
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <LinearGradient
          colors={this.state.bodyColor}
          style={styles.gradientContainer}>
          <>
            <View style={styles.verifyContainer}>
              <Text style={styles.name}>
                {!this.state.userInfo ||
                this.state.userInfo.first_name === undefined
                  ? ''
                  : this.state.userInfo.first_name}
              </Text>
              {varified === 1 && (
                <Icon1
                  name={'checkcircle'}
                  style={{marginLeft: scale(10)}}
                  size={scale(18)}
                  color={theme.colors.blue}
                />
              )}
            </View>
            {this.state.userInfo.country !== null && (
              <View style={styles.cityView}>
                <Text style={styles.country}>
                  {!this.state.userInfo || this.state.userInfo.country === null
                    ? ''
                    : this.state.userInfo.country}
                </Text>
              </View>
            )}
            <ScrollView
              nestedScrollEnabled={true}
              onScroll={this.closeMoreOptions}
              style={{
                height: theme.SCREENHEIGHT,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={false}
                  onRefresh={this.handleRefresh}
                />
              }>
              {this.state.userInfo === '' ? null : (
                <View
                  style={[externalStyle.shadow, styles.card]}
                  onStartShouldSetResponderCapture={() => {
                    this.setState({enableScrollViewScroll: true});
                  }}>
                  <View style={styles.cardView}>
                    {counts?.totalPoints !== '' && (
                      <>
                        <Image
                          source={{uri: userInfo.rank?.image}}
                          style={styles.imageView}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                        <View style={styles.rankView}>
                          <View style={styles.rank}>
                            <Text
                              style={[
                                styles.text,
                                {color: userInfo.rank?.color},
                              ]}>
                              {userInfo.rank?.name}
                            </Text>

                            <Text
                              style={[
                                styles.text,
                                {color: userInfo.rank?.color},
                              ]}>
                              {total} Jul
                            </Text>
                          </View>
                          <View style={styles.outerProgress}>
                            <View
                              style={[
                                styles.innnerProgess,
                                {
                                  backgroundColor: userInfo.rank?.color,
                                  width: userInfo.rank?.percentage,
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
                      <View style={{flexDirection: 'row'}}>
                        <Label
                          title={getLocalText('UserData.scoreboardTitle')}
                          style={styles.text1}
                        />
                        <TouchableOpacity
                          onPress={this.handlePopUpModel}
                          style={styles.helpIcon}>
                          <Icon
                            name={'help-circle'}
                            color={theme.colors.blue}
                            size={scale(16)}
                          />
                        </TouchableOpacity>
                      </View>
                      <PopUpModel
                        isVisible={popUpModel}
                        close={this.handlePopUpModel}
                        title={getLocalText('Information.pointstitle')}
                        description={getLocalText('Information.pointsdisc')}
                      />
                      <View style={[externalStyle.shadow, styles.statusView]}>
                        {statusData.map((d, i) => {
                          return (
                            <View
                              key={i.toString()}
                              style={[
                                styles.cardView,
                                {marginVertical: scale(7)},
                              ]}>
                              <Icon
                                style={{marginVertical: scale(3)}}
                                name={d?.icon}
                                size={scale(16)}
                                color={theme.colors.blue}
                              />
                              <Text
                                // numberOfLines={2}
                                style={[
                                  styles.textStats,
                                  {
                                    flexWrap: 'wrap',
                                    maxWidth: theme.SCREENWIDTH * 0.52,
                                  },
                                ]}>
                                {`${d?.name} (${d?.count})`}
                              </Text>
                              <Svg
                                height={1}
                                style={[
                                  styles.flex,
                                  {marginRight: 40, marginVertical: scale(12)},
                                ]}>
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
                                style={[styles.textStats, styles.monthPoints]}>
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
                        // isMoreContent ? theme.colors.blue : theme.colors.grey11
                        isMoreContent
                          ? theme.colors.blue
                          : theme.colors.darkGrey
                      }
                    />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.fillterCon}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: scale(18),
                  }}>
                  {tabs.map((data, index) => {
                    return (
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
                                    ` ' ${getLocalText('UserData.group')}` +
                                    ` (${groupsData?.length}) `
                                  : this.state.userInfo.first_name +
                                    data.title +
                                    ` (${groupsData?.length}) `
                              }
                              style={{
                                color:
                                  index === 0
                                    ? userInfo.rank?.color
                                    : theme.colors.blue,
                              }}
                            />
                          ) : index === 2 ? (
                            <Label
                              title={
                                !this.state.userInfo ||
                                this.state.userInfo.first_name === undefined
                                  ? ' '
                                  : last === 's'
                                  ? this.state.userInfo.first_name +
                                    `' ${getLocalText('Timeline.friend')}` +
                                    `(${friends.length})`
                                  : this.state.userInfo.first_name +
                                    data.title +
                                    ` (${friends.length})  `
                              }
                              style={{
                                color:
                                  index === 2
                                    ? userInfo.rank?.color
                                    : theme.colors.blue,
                              }}
                            />
                          ) : (
                            <Label
                              title={
                                // this.state.userInfo.first_name + data.title
                                !this.state.userInfo ||
                                this.state.userInfo.first_name === undefined
                                  ? ' '
                                  : last === 's'
                                  ? this.state.userInfo.first_name +
                                    `' ${getLocalText('Settings.profile')}`
                                  : this.state.userInfo.first_name + data.title
                              }
                              style={{
                                color:
                                  index === 1
                                    ? userInfo.rank?.color
                                    : theme.colors.blue,
                              }}
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
                      // onRefresh={this.handleRefresh}
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
              ) : isProfileActive === 2 ? (
                <>
                  <FlatList
                    data={friends}
                    extraData={this.state}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={this.renderFriends}
                    contentContainerStyle={styles.containerView}
                    // style={{height: theme.SCREENHEIGHT * 95}}
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
                </>
              ) : (
                this.renderProfiles()
              )}

              <Menus
                menuMainContainer={{
                  marginTop:
                    Platform.OS === 'ios'
                      ? theme.SCREENHEIGHT * 0.033
                      : theme.SCREENHEIGHT * 0.105,
                }}
                isMenu={toggleMenu}
                menuData={option}
                isHelpIcon
                handleMenu={this.handleMenus}
              />

              <FullMediaModel
                isShow={this.state.fullScreenMedia}
                closeModel={() => {
                  this.setState({fullScreenMedia: !this.state.fullScreenMedia});
                }}
                postImages={this.state.userImage}
              />

              <Loader loading={this.state.loadding} />
            </ScrollView>
          </>
        </LinearGradient>
        {this.state.optionsShow &&
          this.state.groupSelectedId ===
            this.state.groupsData[this.state.groupIndex].id && (
            <View
              style={[
                styles.menusCon,
                {
                  top: this.state.indicatorOffset + scale(15),
                  // this.state.indicatorOffset > 530
                  //   ? this.state.indicatorOffset * 0.5
                  //   : this.state.indicatorOffset + scale(15),
                },
              ]}>
              {(this.state.userInfo.id ===
              this.state.groupsData[this.state.groupIndex].group_admin_id
                ? optionsData1
                : optionsData
              ).map((itm, idx) => {
                return (
                  <TouchableOpacity
                    key={idx.toString()}
                    onPress={() => {
                      this.handleOptions(
                        this.state.groupsData[this.state.groupIndex],
                        idx,
                      );
                    }}>
                    <View style={styles.menuModalStyle}>
                      <Icon
                        name={itm.icon}
                        size={20}
                        color={theme.colors.blue}
                        style={{marginRight: 10}}
                      />
                      <Label title={itm.name} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        <ConfirmationModel
          isVisible={this.state.deleteModel || this.state.leaveGroup}
          type={this.state.leaveGroup ? 'groupexit' : ''}
          close={
            this.state.leaveGroup ? this.exitHandleGroup : this.deleteGroup
          }
        />
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
  },
  headerImage: {
    width: '100%',
    height: isIphoneX()
      ? theme.SCREENHEIGHT * 0.15 + scale(20)
      : theme.SCREENHEIGHT * 0.15,
    resizeMode: 'cover',
  },
  containerView: {
    paddingHorizontal: scale(20),
  },
  userImage: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    alignSelf: 'center',
    marginTop: -scale(60),
    zIndex: 111,
  },
  name: {
    textAlign: 'center',
    marginTop: scale(5),
    fontFamily: theme.fonts.muktaBold,
    color: theme.colors.grey2,
    fontSize: scale(16),
  },
  country: {
    textAlign: 'center',
    fontFamily: theme.fonts.muktaVaaniSemiBold,
    color: theme.colors.grey2,
    fontSize: scale(14),
  },
  card: {
    backgroundColor: theme.colors.white,
    marginVertical: scale(16),
    marginHorizontal: scale(18),
    borderRadius: scale(18),
    padding: scale(13),
    paddingBottom: scale(5),
  },
  card1: {
    backgroundColor: theme.colors.white,
    marginHorizontal: scale(18),
    borderRadius: scale(15),
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  btnMenu: {
    height: scale(40),
    width: scale(40),
    backgroundColor: theme.colors.white,
    position: 'absolute',
    right: scale(20),
    top: scale(40),
    borderRadius: scale(20),
    zIndex: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageView: {
    height: scale(40),
    width: scale(40),
    alignItems: 'center',
    justifyContent:'center',
    borderRadius: scale(20),
    aspectRatio: 0.92 / 1,
  },
  circle: {
    borderWidth: 5,
    height: theme.SCREENWIDTH * 0.12,
    width: theme.SCREENWIDTH * 0.12,
    borderRadius: theme.SCREENWIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.red1,
  },
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
    width: '50.66%',
  },
  downIcon: {alignSelf: 'center', padding: scale(5)},
  text1: {marginTop: scale(9), marginBottom: scale(14), fontSize: scale(12)},
  helpIcon: {
    paddingHorizontal: scale(10),
    marginTop: scale(10),
  },
  textStats: {
    color: theme.colors.grey12,
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    marginHorizontal: scale(12),
  },
  monthPoints: {
    color: theme.colors.black,
    marginRight: scale(0),
    fontFamily: theme.fonts.muktaMedium,
    position: 'absolute',
    right: scale(0),
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT / 3,
  },
  aboutuser: {
    fontFamily: theme.fonts.muktaVaaniLight,
    color: theme.colors.grey2,
    fontSize: scale(14),
    textAlignVertical: 'center',
    alignItems: 'center',
    flex: 1,
  },
  editContainer: {
    padding: scale(5),
    borderRadius: scale(5),
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
  gradientContainer: {flex: 1, zIndex: -1},
  menusCon: {
    right: scale(23),
    top: scale(50),
    borderRadius: scale(13),
    width: '65%',
    paddingVertical: scale(15),
    paddingHorizontal: scale(10),
    backgroundColor: theme.colors.white,
    position: 'absolute',
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.2,
    elevation: 1,
  },
  menuModalStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(10),
  },
  aboutContain: {
    flex: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
    height: theme.SCREENHEIGHT * 0.15,
  },
  imagContainer: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: theme.SCREENHEIGHT * 0.18,
    zIndex: 11,
  },
  verifyContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: '12%',
  },
  subView: {
    position: 'absolute',
    right: scale(10),
    padding: scale(3),
  },
  cityView: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  const userDetails = state.UserInfo.data;
  const groupCount = state.UserInfo.joinGroupCount;
  const groupList = state.groupsReducer.group_list;
  const getJoinedGroupsList = state.groupsReducer.joinGroup_list;
  const getJoinedGroupsC_Page = state.groupsReducer.joinGroupCurrentPage;
  const getJoinedGroupsT_Page = state.groupsReducer.joinGroupTotalPage;
  const notification = state.groupsReducer.groupNotication;
  const created_g_count = state.UserInfo.creaetedGroupCount;
  const coverImageBg = state.UserInfo.coverImagePath;

  return {
    userDetails,
    groupList,
    getJoinedGroupsList,
    getJoinedGroupsT_Page,
    groupCount,
    notification,
    getJoinedGroupsC_Page,
    created_g_count,
    coverImageBg,
  };
};
export default connect(mapStateToProps, {
  getGroups,
  getJoinedGroups,
  manageNotification,
  getJoinGroupCount,
  userData,
  exitGroup,
  CreatedGroupCount,
})(UserData);
