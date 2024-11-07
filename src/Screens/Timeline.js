import React, {PureComponent} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Keyboard,
  RefreshControl,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  AppState,
  Linking,
} from 'react-native';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Entypo';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import {connect} from 'react-redux';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from 'react-native-fast-image';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
// import EmojiBoard from './EmojiBoard';
import {
  getPost,
  getPostLocally,
  addPost,
  isPostLoading,
  postLikeShareSave,
  commentLike,
  postCommentSend,
  blockAction,
  susPendNotification,
  makeSponsorPost,
  getReportReasonList,
  isLogin,
  logout,
  setNotificationBellIcon,
  setNewPostBadge,
  setNewChatBadge,
  exitGroup,
  getJoinedGroups,
} from '../Redux/Actions';
import {scale, imageData, theme, images} from '../Utils';
import {
  SearchBar,
  PostBar,
  BackgroundChunk,
  Label,
  Sponsor,
  PerfectModel,
  PaymentModel,
  PostCard,
  PostponedModel,
  MediaOptions,
  PostOptions,
  GalleryModel,
  Loader,
  Loading,
  GroupsJoinedModel,
  SearchModel,
  ShareOptions,
  SharePostGroupModel,
  PostViewerModel,
  GroupCard,
  PopUpModel,
  ConfirmationModel,
  ContentSponsorModel,
  ReactionModel,
  PostsCommentModel,
  OfflineModel,
  ImagesViewModel,
} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {API, appAPI, getAPICall, postAPICall} from '../Utils/appApi';
import externalStyles from '../Css';
import {getDynamicLink} from '../Utils/helper';
import {DeepLink, SCREEN_TYPE, notificationTypes} from '../Utils/StaticData';
import CameraVideoPhoto from '../Components/CameraVideoPhoto';
import EmojiPicker from 'rn-emoji-keyboard';

var loadMoreData = false;
class Timeline extends PureComponent {
  dynamicLinkSubscriber = null;
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isEmojiKeyboard: false,
      isEmojiKeyboardC: false,
      postText: '',
      mediaOption: false,
      imagesView: false,
      attachImages: [],
      userPost: [],
      sponsorModel: false,
      postOption: '',
      postOptionIndex: '',
      postLikeOption: '',
      postLikeOptionIndex: '',
      indicatorOffset: 0,
      indicatorOffsetForLike: 0,
      handleOption: false,
      thumbnail: [],
      getGroupPost: [],
      options: [
        {icon: 'bookmark', name: getLocalText('Timeline.save')},
        {icon: 'eye-off', name: getLocalText('Timeline.hide')},
        {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
        {icon: 'corner-right-up', name: getLocalText('Post.reshare')},
        {icon: 'trash-2', name: getLocalText('Timeline.delete')},
      ],
      likOption: [
        {icon: images.likeEmoji},
        {icon: images.heartEmoji},
        {icon: images.clapEmoji},
        {icon: images.happyEmoji},
        {icon: images.angryEmoji},
      ],
      paymentModel: false,
      perfectModel: false,
      perfectModel2: false,
      isOwnPost: false,
      reportModel: false,
      reportDetails: false,
      postPone: false,
      cameraModel: false,
      day: '',
      commonText: '',
      postDetails: [],
      viewPost: [],
      refreshing: false,
      shareData: null,
      loading: false,
      page: 1,
      totalPage: 1,
      loadMore: false,
      postReport: '',
      groupShowModel: false,
      commentView: false,
      groupName: '',
      reportType: '',
      searchModel: false,
      sponsorData: null,
      selectedPost: null,
      bodyColor: theme.defaultGradient,
      openLoader: false,
      fullScreenView: false,
      shareOptionsModel: false,
      shareGroupsModel: false,
      selectSearch: null,
      searchData: [],
      postDeleteModel: false,
      exitGroupModel: false,
      popUpModel: false,
      userImagePost: [],
      sponsorAlertList: [],
      isShowSponsorAlert: false,
      paymentCardData: [],

      viewPostIndex: -1,
      postCommentView: false,
      lastPostId: 0,
      commentedIndex: -1,
      isSponsoredByLoggedInUser: '',
    };
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
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

  componentDidMount = async () => {
    var fcm = await this.getFcmToken();
    console.log('FCM ->', fcm);

    const {userData, getNewPostBadge, navigation} = this.props;
    AppState.addEventListener('change', this.handleAppStateChange);
    let token = await AsyncStorage.getItem('@loginToken');
    console.log('access_token ->', token);
    if (token !== null) {
      appAPI.defaults.headers.common['Content-Type'] = 'application/json';
      appAPI.defaults.headers.common.Accept = 'application/json';
      appAPI.defaults.headers.common.Authorization = token;
    }

    await this.props.isPostLoading(false);
    await this.getAllPost();

    await this.handleDeepLink();
    console.log('COMPONENTDID MOUNT.....');

    await this.messageListener();
    this.setState({
      bodyColor: userData?.color ? userData?.color : theme.defaultGradient,
    });

    if (getNewPostBadge === true) {
      this.props.setNewPostBadge(false);
    }
    this.focusListener = this.props.navigation.addListener('focus', () => {
      this.props.getJoinedGroups(1);
    });

    this.props.getJoinedGroups(1);
    this.focusListener = await navigation.addListener('focus', async () => {
      this.getSponsorAlert();
      await this.handleGroup();
      if (getNewPostBadge === true) {
        this.props.setNewPostBadge(false);
      }
    });
  };

  async componentWillUnmount() {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.removeEventListener();
    }
    AppState.removeEventListener('change', this.handleAppStateChange);

    clearInterval(this.Clock);

    if (this.focusListener) {
      this.focusListener();
    }

    if (this.dynamicLinkSubscriber) {
      this.dynamicLinkSubscriber();
      this.dynamicLinkSubscriber = null;
    }
    this.focusListener();
  }

  handleAppStateChange = nextAppState => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }
    if (nextAppState === 'active') {
      PushNotification.removeAllDeliveredNotifications();
    }
  };

  //handle deep link
  handleDeepLink = async () => {
    Linking.addEventListener('url', ({url}) => {
      this.handleDynamicLink(url);
    });

    Linking.getInitialURL().then(async url => {
      const data = JSON.parse(JSON.stringify(url));
      const urlLink = data;
      const id = urlLink.substring(url.lastIndexOf('=') + 1);
      this.getSinglePost(id);
    });
  };

  messageListener = async () => {
    console.log('messageListener....');

    let notificationRouteType = '';
    let notificationMessage = '';
    await PushNotification.configure({
      onNotification: notification => {
        const {foreground, userInteraction} = notification;
        if (foreground && !userInteraction) {
          PushNotification.localNotification(notification);
          notificationRouteType = notification.data?.notification_type;
          notificationMessage = notification;
        }

        if (foreground && userInteraction) {
          this.loadScreenFromMessage(
            notificationRouteType
              ? notificationRouteType
              : notification?.data?.notification_type,
            notificationMessage ? notificationMessage : notification,
          );
        }
        if (!foreground && userInteraction) {
          this.loadScreenFromMessage(
            notificationRouteType
              ? notificationRouteType
              : notification?.data?.notification_type,
            notificationMessage ? notificationMessage : notification,
          );
        }
      },
      popInitialNotification: true,
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: true,
    });
    await messaging()
      .getInitialNotification()
      .then(async response => {});

    messaging().onNotificationOpenedApp(async remoteMessage => {
      if (remoteMessage) {
        await this.loadScreenFromMessage(
          remoteMessage?.data?.type || remoteMessage?.data?.notification_type,
          remoteMessage,
        );
      }
    });

    messaging().onMessage(async remoteMessage => {
      console.log('messaging().onMessage....');
      console.log('remoteMessage ->', remoteMessage);
      if (Platform.OS === 'ios') {
        PushNotificationIOS.getApplicationIconBadgeNumber(badge => {
          PushNotificationIOS.setApplicationIconBadgeNumber(badge + 1);
        });
      }
      console.log('showNotification OUTSIDE.....');
      this.showNotification(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.getApplicationIconBadgeNumber(async badge => {
          PushNotificationIOS.setApplicationIconBadgeNumber(badge + 1);
        });
      }
    });
  };

  getChatRoomListApi = async (group_id, roomId) => {
    this.getGroupApi(group_id);
    let response = await getAPICall(API.getSingleRoom + roomId);
    const lastGroupChatId = await getAPICall(API.lastGroupChatId + roomId);
    let paramObj = {
      groupData: this.state.getGroupPost,
      members: response.data,
      newJoin: false,
      roomData: response.data,
      roomId: roomId,
      lastGroupChatId: lastGroupChatId,
    };
    this.props.navigation.navigate('Chat', paramObj);
  };

  getGroupApi = async group_id => {
    try {
      const response = await getAPICall(API.getSingleGroup + group_id);
      if (response.success) {
        this.setState({
          getGroupPost: response.data,
        });
      }
    } catch (error) {}
  };

  showNotification = remoteMessage => {
    console.log('showNotification....');
    console.log('remoteMessage ->', remoteMessage);

    PushNotification.getChannels(function (channel_ids) {});
    PushNotification.checkPermissions(function (permissions) {});

    PushNotification.createChannel(
      {
        channelId: remoteMessage?.messageId,
        channelName: 'channel-id1',
      },
      created => {
        if (created) {
          PushNotification.localNotification({
            autoCancel: true,
            channelId: 'channel-id1',
            bigText: remoteMessage?.notification?.body,
            subText: '',
            userInfo: remoteMessage?.notification && remoteMessage?.data,
            title: remoteMessage?.notification?.title,
            message: remoteMessage?.notification?.body,
            vibrate: true,
            vibration: 1000,
            repeatTime: 1,
            playSound: true,
            soundName: 'wind',
          });
        }
      },
    );
    console.log(
      'remoteMessage?.data?.notification_type ->',
      remoteMessage?.data?.notification_type,
    );
    console.log(
      'notificationTypes.newMessageInPersonalChatroom ->',
      notificationTypes.newMessageInPersonalChatroom,
    );
    console.log(
      'remoteMessage?.data?.notification_type === notificationTypes.newMessageInPersonalChatroom ->',
      remoteMessage?.data?.notification_type ===
        notificationTypes.newMessageInPersonalChatroom,
    );

    console.log('setNotificationBellIcon....');

    // this.props.setNotificationBellIcon(
    //   remoteMessage?.data?.notification_type ===
    //   notificationTypes.newMessageInPersonalChatroom
    //   ? false
    //     : true,
    // );
    this.props.setNotificationBellIcon(true);

    if (remoteMessage?.data?.notification_type === notificationTypes.newPost) {
      this.props.setNewPostBadge(true);
    } else if (
      remoteMessage?.data?.notification_type ===
      notificationTypes.newMessageInPersonalChatroom
    ) {
      console.log(
        'remoteMessage?.data?.notification_type === notificationTypes.newMessageInPersonalChatroom',
        remoteMessage?.data?.notification_type ===
          notificationTypes.newMessageInPersonalChatroom,
      );

      this.props.setNewChatBadge(true);
    }
  };

  loadScreenFromMessage = async (notificationType, response) => {
    const {navigation} = this.props;
    if (
      notificationType === notificationTypes.newMessageInPersonalChatroom ||
      notificationType === notificationType.INVITE_PERSONAL_CHAT
    ) {
      const userID = response?.data?.redirect_id;
      let chatResponse = await getAPICall(API.chat + userID);
      navigation.navigate('Chat', {
        data: chatResponse?.data,
        singleChat: '1',
      });
    } else if (
      notificationType === notificationTypes.postSponsored ||
      notificationType === notificationTypes.postSponsorAlert
    ) {
      await this.getSponsorAlert();
    } else if (
      notificationType === notificationTypes.invitationPrivateConversation ||
      notificationType === notificationTypes.newMessageInChatroom
    ) {
      if (response.group_id !== null) {
        this.getChatRoomListApi(
          response?.data?.group_id,
          response?.data?.redirect_id,
        );
      }
    }
    if (
      notificationType === notificationTypes.postLiked ||
      notificationType === notificationTypes.likeOnComment ||
      notificationType === notificationTypes.sponsorPostLiked ||
      notificationType === notificationTypes.POST_SHARED
    ) {
      await this.getGroupApi(response?.data?.group_id);
      navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state?.getGroupPost,
          joined: true,
          notification: true,
          redirect_id: response?.data?.redirect_id,
        },
      });
    } else if (
      notificationType === notificationTypes.commentOnPost ||
      notificationType === notificationTypes.commentOnSponsorPost
    ) {
      await this.getGroupApi(response?.data?.group_id);
      navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state.getGroupPost,
          joined: true,
          notification: true,
          redirect_id: response?.data?.redirect_id,
        },
      });
    } else if (notificationType === notificationTypes.newPost) {
      await this.getGroupApi(response?.data?.group_id);
      navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state.getGroupPost,
          joined: true,
          notification: true,
          redirect_id: response?.data?.redirect_id,
        },
      });
    } else if (notificationType === notificationTypes.groupRequestAccepted) {
      await this.getGroupApi(response?.data?.group_id);
      navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state.getGroupPost,
          joined: true,
        },
      });
    }
    if (
      notificationType.trim() ===
        notificationTypes.invitationPrivateAudioRoom ||
      notificationType === notificationTypes.audioRoomConversationStarted
    ) {
      await this.getGroupApi(response?.data?.group_id);
      await this.props.navigation.navigate('GroupDetails', {
        item: {groupData: this.state.getGroupPost, joined: true, category: 3},
      });
    }
    if (
      notificationType.trim() === notificationTypes.JOIN_GROUP_REQUEST ||
      notificationType === notificationTypes.FRIEND_REQUEST_RECEIVED ||
      notificationType === notificationTypes.FRIEND_REQUEST_ACCEPTED
    ) {
      await this.props.navigation.navigate('Notification');
    }
  };

  handleDynamicLink = async link => {
    if (link) {
      const data = JSON.parse(JSON.stringify(link));
      // const url = data.url;
      const id = data.substring(link.lastIndexOf('=') + 1);
      if (id) {
        await this.getSinglePost(id);
        // }
      } else {
        await this.navigateLogin();
      }
    }
  };

  getSinglePost = async id => {
    try {
      this.setState({openLoader: true});
      let success = await getAPICall(API.getSinglePost + id);
      if (success.error) {
        this.setState({openLoader: false});
      } else {
        this.setState({openLoader: false});
        if (success?.data) {
          this.setState({
            imagesView: !this.state.imagesView,
            postDetails: {...success?.data, index: 0},
          });
        }
      }
    } catch (error) {
      this.setState({openLoader: false});
    }
  };

  getAllPost = async () => {
    const {errorStatus, navigation} = this.props;
    this.setState({loading: true});
    var postResponse = await this.props.getPost(1, 0);
    await this.props.getReportReasonList();
    this.getSponsorAlert();
    if (postResponse) {
      this.setState({
        userPost: postResponse?.data || [],
        loading: false,
        lastPostId: postResponse.last_message_id || 0,
      });
    } else {
      this.setState({loading: false});
      Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
    }

    if (errorStatus?.errorMsg?.message === 'Unauthenticated.') {
      navigation.replace('Login');
      AsyncStorage.clear();
      this.props.logout();
      this.props.isLogin(false);
    }
  };

  closePostpone = () => {
    this.setState({postPone: false});
  };

  _keyboardDidShow() {
    this.setState({isEmojiKeyboard: false, isEmojiKeyboardC: false});
  }

  _keyboardDidHide() {}

  setEmoji = emoji => {
    console.log('emoji', emoji);
    const key = this.state.isEmojiKeyboard ? 'postText' : 'commonText';
    if (this.state.isEmojiKeyboard) {
      this.setState({[key]: this.state[key] + emoji.emoji});
    } else {
      if (this.state.searchText) {
        let commentItem =
          this.state.searchData.posts[this.state?.commentedIndex];
        commentItem.commentTxt =
          commentItem != null && commentItem?.commentTxt
            ? commentItem.commentTxt + emoji.emoji
            : emoji.emoji;
        this.setState({searchData: this.state.searchData});
      } else {
        let commentItem = this.state.userPost[this.state?.commentedIndex];
        commentItem.commentTxt = commentItem?.commentTxt
          ? commentItem.commentTxt + emoji.emoji
          : emoji.emoji;
        this.setState({userPost: this.state.userPost});
      }
    }
  };

  searchHandle = txt => {
    this.setState({searchText: txt});
  };

  handlePostTxt = text => {
    this.setState({postText: text});
  };

  handleCommentTxt = async (text, data, index) => {
    data.commentTxt = text;
    // this.setState({searchData: this.state.searchData, commentedIndex: index});

    const updatedSearchData = [...this.state.searchData];

    updatedSearchData[index] = {
      ...updatedSearchData[index],
      commentTxt: text,
    };

    this.setState({
      searchData: updatedSearchData,
      commentedIndex: index,
    });
    await this.props.getPost(1, 0);
  };

  openImagePicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      width: 300,
      height: 400,
      mediaType: 'photo',
      cropping: true,
      includeBase64: true,
    }).then(d => {
      d.map(item => {
        if (item?.mime.slice(0, 5) === 'video') {
          let videoName = imageData(
            Platform.OS === 'ios' ? item?.sourceURL : item?.path,
          );
          this.setState({
            attachImages: [
              ...this.state.attachImages,
              {
                video: {
                  uri: item?.path,
                  name: videoName.name,
                  type: item?.mime,
                },
              },
            ],
            mediaOption: false,
          });
        } else {
          ImageResizer.createResizedImage(
            item?.path,
            700,
            700,
            'PNG',
            100,
            0,
          ).then(compressedImage => {
            this.setState({
              attachImages: [
                ...this.state.attachImages,
                {
                  uri:
                    Platform.OS === 'ios'
                      ? compressedImage.path
                      : compressedImage.uri,
                  type: 'image/jpeg',
                  name: compressedImage.name,
                },
              ],
              mediaOption: false,
            });
          });
        }
      });
    });
  };

  openVideoPicker = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      multiple: true,
      includeExif: true,
      compressVideoPreset: '640x480',
    }).then(async video => {
      video.map(item => {
        if (item?.mime.slice(0, 5) === 'video') {
          let videoName = imageData(
            Platform.OS === 'ios' ? item?.sourceURL : item?.path,
          );
          this.setState({
            attachImages: [
              ...this.state.attachImages,
              {
                video: {
                  uri: item?.path,
                  name: videoName?.name,
                  type: item?.mime,
                },
              },
            ],
            mediaOption: false,
          });
        }
      });
    });
  };

  renderFooter = () => {
    if (!this.state.loadMore) {
      return null;
    } else {
      return (
        <ScrollView>
          {[1].map((_, i) => (
            <View key={i.toString()} style={[styles.postCard]}>
              <Loading />
            </View>
          ))}
        </ScrollView>
      );
    }
  };

  loadMore = async () => {
    const {allData} = this.props;
    if (allData?.data) {
      if (!loadMoreData && this.state.page < allData.total_page) {
        this.setState({loadMore: true});
        loadMoreData = true;
        let page = this.state.page + 1;
        var res = await this.props.getPost(page, this.state.lastPostId);
        let data = [...this.state.userPost, ...res?.data];
        this.setState(
          {
            userPost: data,
            loadMore: false,
            page: page,
          },
          () => {
            loadMoreData = false;
          },
        );
      } else {
        this.setState({loadMore: false});
      }
    }
  };

  openFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      const response = Platform.OS === 'ios' ? res : res?.[0];

      this.setState({
        attachImages: [
          ...this.state.attachImages,
          {
            pdf: response?.uri,
            type: Platform.OS === 'ios' ? 'application/pdf' : response?.type,
            name: response?.name,
          },
        ],
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
    this.setState({mediaOption: !this.state.mediaOption});
  };

  removeImage = (item, index) => {
    // this.state.attachImages.splice(index, 1);
    // this.setState({
    //   attachImages: this.state.attachImages,
    // });
    const updatedAttachImages = this.state.attachImages.filter(
      (_, i) => i !== index,
    );

    this.setState({
      attachImages: updatedAttachImages,
    });
  };

  handlePostModal = (item, index, evt) => {
    this.setState({
      postOption: item?.id,
      postReport: item,
      postOptionIndex: this.state.postOptionIndex === index ? '' : index,
      indicatorOffset: evt.nativeEvent.pageY,
      handleOption: !this.state.handleOption,
    });
  };

  // post reaction modal
  handlePressLike = async (item, index, evt) => {
    const updatedPostLikeOptionIndex =
      this.state.postLikeOptionIndex === index ? '' : index;

    this.setState({
      postLikeOption: item?.id,
      postLikeOptionIndex: updatedPostLikeOptionIndex,
      indicatorOffsetForLike: evt.nativeEvent.pageY,
    });
  };

  //post save
  handleSavePost = async item => {
    const {isPostLike} = this.props;
    let postIndex = this.state.postOptionIndex;
    try {
      await this.props.postLikeShareSave(item, 'save');
      if (isPostLike) {
        this.state.userPost[postIndex].is_save =
          !this.state.userPost[postIndex].is_save;
        this.setState({userPost: this.state.userPost});
      }
    } catch (error) {
      this.props.isPostLoading(0);
    }
  };
  handlePopUpModel = () => {
    this.setState({popUpModel: !this.state.popUpModel});
  };

  postOptionClose = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        postOption: '',
        postOptionIndex: '',
        handleOption: !prevState.handleOption,
      };
    });
  };

  handleOptions = async (index, item, data) => {
    this.setState({selectedPost: data});
    this.postOptionClose();
    if (index === -1) {
      switch (data?.is_sponsored_by_loggedin_user) {
        case 0:
          await this.setState(prevState => {
            return {
              ...prevState,
              perfectModel2: !prevState.perfectModel2,
              isSponsoredByLoggedInUser: data?.is_sponsored_by_loggedin_user,
            };
          });
          break;
        case 1:
          await this.setState(prevState => {
            return {
              ...prevState,
              perfectModel2: !prevState.perfectModel2,
              isSponsoredByLoggedInUser: data?.is_sponsored_by_loggedin_user,
            };
          });
          break;
        case '':
          this.setState({
            loading: true,
            sponsorModel: !this.state.sponsorModel,
          });
          break;
      }
      await this.getAllPaymentCards();
    } else if (index === 0) {
      this.handleSavePost(item);
    } else if (index === -2) {
      this.props.navigation.push('Statistics', {data: data});
    } else if (index === 2) {
      this.setState({exitGroupModel: true});
    } else if (index === 1) {
      try {
        let postIndex = this.state.postOptionIndex;
        await this.props.postLikeShareSave(item, 'hide');
        this.state.userPost.splice(postIndex, 1);
        this.setState({userPost: this.state.userPost});
      } catch (error) {
        this.setState({loading: false});
      }
    } else if (index === 3) {
      let response = await getAPICall(API.reshare + item);
      if (response.success) {
        const newUserPostData = this.state.userPost.map(d => {
          return {
            ...d,
            is_reshared: item === d.id ? !d.is_reshared : d.is_reshared,
          };
        });
        this.setState({userPost: newUserPostData});
      }
    } else if (index === 4) {
      this.setState({postDeleteModel: true});
    }
  };
  closeSponsorModel = async (data, day, people, amoutPayable) => {
    this.setState({sponsorModel: false});
    if (data !== 'close') {
      if (data) {
        this.setState({
          sponsorData: {
            day: day,
            amount: amoutPayable,
            people: people,
          },
        });
      }
      setTimeout(() => {
        this.setState({paymentModel: true});
      }, 1000);
    }
  };

  deletepostAction = async action => {
    this.setState({postDeleteModel: false});
    if (action === 1) {
      try {
        let postIndex = this.state.postOptionIndex;
        let posttId = this.state.selectedPost.id;
        let DeletePost = await getAPICall(API.deletePost + posttId);
        if (DeletePost) {
          this.state.userPost.splice(postIndex, 1);
          this.setState({userPost: this.state.userPost});
        }
      } catch (error) {
        this.setState({loading: false});
      }
    }
  };

  exitGroupAction = async action => {
    this.setState({exitGroupModel: false});
    if (action === 1) {
      let groupId = this.state.selectedPost.group.id;
      this.props.exitGroup(groupId);
      this.handleRefresh();
      setTimeout(() => {
        this.props.getJoinedGroups(1);
      }, 800);
    }
  };

  closePaymentModal = async (type, obj = {}) => {
    const {allData, navigation} = this.props;
    const {selectedPost, sponsorData} = this.state;
    let postId = selectedPost?.id,
      persons = sponsorData?.people,
      day = sponsorData?.day,
      amount = sponsorData?.amount;

    // this.setState({paymentModel: false});
    this.setState({sponsorModel: false});
    setTimeout(() => {
      this.setState({perfectModel: true});
    }, 1000);

    if (type === 1) {
    } else if (type === 2) {
      Alert.alert(
        getLocalText('Sponsor.cardUpload'),
        getLocalText('Sponsor.addCard'),
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('CardDetail', {
                cardData: '',
                edit: true,
                newCard: true,
              });
            },
          },
        ],
      );
    } else {
      try {
        this.props.isPostLoading(true);
        let makeSponsorForm = new FormData();
        makeSponsorForm.append('post_id', postId);

        if (type === 3) {
          makeSponsorForm.append('no_of_people', obj.no_of_people);
          makeSponsorForm.append('price', obj.price);
          makeSponsorForm.append('transaction_id', obj.transaction_id);
          makeSponsorForm.append('type', obj.type);
          makeSponsorForm.append('days', 0);
        } else {
          makeSponsorForm.append('no_of_people', persons);
          makeSponsorForm.append('days', day);
          makeSponsorForm.append('price', amount ? amount : 0);
        }

        let response = await postAPICall(
          API.makeSponsorPostNew,
          makeSponsorForm,
        );

        this.props.isPostLoading(false);
        if (response.error) {
          Alert.alert(response?.errorMsg);
        } else {
          if (response?.data?.user_own_sponser_post) {
            var allPostDetail = allData;
            const postIndex = allPostDetail?.data.findIndex(
              d => d.id === postId,
            );

            allPostDetail.data[postIndex].is_sponsored = 1;
            this.props.getPostLocally(allPostDetail);
            this.setState({
              userPost: allPostDetail?.data,
              isOwnPost: response?.data?.user_own_sponser_post,
            });
          }
          this.getAllPost();
          // this.closePerfectModel();
          // setTimeout(() => {
          //   this.closePerfectModel();
          //   console.log('4 4 4 4 4====>');
          // }, 500);
        }
      } catch (error) {
        this.props.isPostLoading(false);
      }
    }
  };

  // check if any sponsor pending in list or not then accept or reject
  getSponsorAlert = async () => {
    try {
      this.props.isPostLoading(true);

      let response = await getAPICall(API.getSponsorAlert);
      this.props.isPostLoading(false);
      if (response.success) {
        if (response?.data.length > 0) {
          this.setState({
            sponsorAlertList: response?.data[0],
            isShowSponsorAlert: true,
          });
        }
      }
    } catch (error) {
      this.props.isPostLoading(false);
    }
  };

  handleSponsorStatus = async type => {
    const {allData} = this.props;
    const {sponsorAlertList: sponsorAlertList} = this.state;
    try {
      this.setState({isShowSponsorAlert: false});
      let params = new FormData();
      this.props.isPostLoading(true);
      params.append('post_id', sponsorAlertList?.post?.id);
      params.append('author_confirm', type);
      params.append('sponsor_id', sponsorAlertList.sponsor_user.id);
      let response = await postAPICall(API.sponsorPostStatus, params);
      if (!response.error) {
        var allPostDetail = allData;
        const postIndex = allPostDetail?.data.findIndex(
          d => d.id === sponsorAlertList?.post?.id,
        );
        allPostDetail.data[postIndex].is_sponsored = 1;
        this.props.getPostLocally(allPostDetail);
        this.props.isPostLoading(false);
        this.setState({
          userPost: allPostDetail?.data,
        });
        this.props.navigation.navigate('ActiveSponsorPost', {
          title: getLocalText('Settings.mySponsor'),
        });
      }
    } catch (error) {
      this.setState({loading: false});
      this.props.isPostLoading(false);
    }
  };

  getAllPaymentCards = async () => {
    try {
      let cards = await getAPICall(API.getAllCards);
      if (cards.success) {
        this.setState({paymentCardData: cards?.data, loading: false});
      }
    } catch (error) {}
  };
  closePerfectModel = async () => {
    await this.setState(prevState => {
      return {
        ...prevState,
        perfectModel: !prevState.perfectModel,
      };
    });
  };
  closePerfectModel2 = async () => {
    await this.setState(prevState => {
      return {
        ...prevState,
        perfectModel2: !prevState.perfectModel2,
      };
    });
  };

  handlePerfectModal = async () => {
    const {navigation} = this.props;
    navigation.navigate('Sponsor');
    this.closePerfectModel();
  };

  //post like emoji
  // onPressLikeEmoji = async value => {
  //   this.closeEmojiModal();
  //   const {postLikeOption, postLikeOptionIndex} = this.state;
  //   var id = '';
  //   if (value === 0) {
  //     id = 1;
  //   } else if (value === 1) {
  //     id = 2;
  //   } else if (value === 2) {
  //     id = 3;
  //   } else if (value === 3) {
  //     id = 4;
  //   } else if (value === 4) {
  //     id = 5;
  //   }
  //   await this.props.postLikeShareSave(postLikeOption, 'like', id);
  //   if (this.props.isPostLike) {
  //     this.state.userPost[postLikeOptionIndex].is_like =
  //       !this.state.userPost[postLikeOptionIndex].is_like;
  //     this.state.userPost[postLikeOptionIndex].emoji =
  //       value === 0
  //         ? 1
  //         : value === 1
  //         ? 2
  //         : value === 2
  //         ? 3
  //         : value === 3
  //         ? 4
  //         : 5;
  //     this.setState({userPost: this.state.userPost});
  //     if (this.state.userPost[postLikeOptionIndex].is_like) {
  //       this.state.userPost[postLikeOptionIndex].total_like =
  //         this.state.userPost[postLikeOptionIndex].total_like + 1;
  //       this.setState({userPost: this.state.userPost});
  //     } else {
  //       this.state.userPost[postLikeOptionIndex].total_like =
  //         this.state.userPost[postLikeOptionIndex].total_like - 1;
  //       this.setState({userPost: this.state.userPost});
  //     }
  //   }
  // };


  onPressLikeEmoji = async (value) => {
    this.closeEmojiModal();
    const {postLikeOption, postLikeOptionIndex} = this.state;
    // Map the emoji value to the corresponding id
    const emojiId =
      value === 0 ? 1 : value === 1 ? 2 : value === 2 ? 3 : value === 3 ? 4 : 5;
    // Call the postLikeShareSave method with emoji id
    await this.props.postLikeShareSave(postLikeOption, 'like', emojiId);
    if (this.props.isPostLike) {
      // Make a copy of the userPost array
      const updatedUserPost = [...this.state.userPost];
      // Get the post at the index that needs to be updated
      const postToUpdate = updatedUserPost[postLikeOptionIndex];
      // Check if the same emoji is clicked again to remove it
      const isSameEmojiClicked = postToUpdate.emoji === emojiId;
      // If the same emoji is clicked, remove the like (set emoji to null and toggle is_like)
      if (isSameEmojiClicked) {
        const updatedPost = {
          ...postToUpdate,
          is_like: false, // Dislike the post
          emoji: null, // Remove emoji
          total_like: postToUpdate.total_like - 1, // Decrease like count
        };
        updatedUserPost[postLikeOptionIndex] = updatedPost;
      } else {
        // If a different emoji is clicked
        let newLikeCount = postToUpdate.total_like;
        // Ensure we don't increment the like count beyond a certain limit (for example, max of 5)
        if (!postToUpdate.is_like) {
          newLikeCount = Math.min(postToUpdate.total_like + 1, 5); // Increment like count, but limit to 5
        }
        const updatedPost = {
          ...postToUpdate,
          is_like: true, // Mark the post as liked
          emoji: emojiId, // Set the new emoji
          total_like: newLikeCount, // Update the like count
        };
        updatedUserPost[postLikeOptionIndex] = updatedPost;
      }
      // Update the state with the modified array
      this.setState({userPost: updatedUserPost});
    }
  };

  closeEmojiModal = () => {
    this.setState({
      postLikeOptionIndex: '',
      postLikeOption: '',
      indicatorOffsetForLike: '',
    });
  };

  //post like
  // onLikePress = async (item, index, isLikeModel) => {
  //   let {searchText} = this.state;
  //   if (searchText === '') {
  //     this.state.userPost[index].is_like = !this.state.userPost[index].is_like;
  //     this.state.userPost[index].total_like = this.state.userPost[index].is_like
  //       ? this.state.userPost[index].total_like + 1
  //       : this.state.userPost[index].total_like - 1;

  //     if (!this.state.userPost[index].is_like) {
  //       this.state.userPost[index].emoji = null;
  //     }

  //     this.setState({userPost: this.state.userPost});

  //     if (this.state.fullScreenView) {
  //       this.setState({viewPost: item});
  //       this.state.viewPost.is_like = !this.state.viewPost.is_like;

  //       if (this.state.viewPost && this.state.viewPost?.is_like) {
  //         this.state.viewPost[index].total_like =
  //           this.state.viewPost[index].total_like + 1;
  //         this.setState({viewPost: this.state.viewPost});
  //       } else {
  //         this.state.viewPost[index].total_like =
  //           this.state.viewPost[index].total_like - 1;
  //         this.setState({viewPost: this.state.viewPost});
  //       }
  //     }
  //   } else {
  //     this.state.searchData.posts[index].is_like =
  //       !this.state.searchData.posts[index].is_like;
  //     this.setState({searchData: this.state.searchData});
  //     if (this.state.searchData.posts[index].is_like) {
  //       this.state.searchData.posts[index].total_like =
  //         this.state.searchData.posts[index].total_like + 1;
  //       this.setState({searchData: this.state.searchData});
  //     } else {
  //       this.state.searchData.posts[index].total_like =
  //         this.state.searchData.posts[index].total_like - 1;
  //       this.setState({searchData: this.state.searchData});
  //     }
  //   }
  //   await this.props.postLikeShareSave(item?.id, 'like');
  // };

  onLikePress = async (item, index, isLikeModel) => {
    let {searchText} = this.state;
    if (searchText === '') {
      // Use immutable update
      const updatedUserPost = [...this.state.userPost];
      // Toggle the like status
      updatedUserPost[index].is_like = !updatedUserPost[index].is_like;
      // Update the total likes
      updatedUserPost[index].total_like = updatedUserPost[index].is_like
        ? updatedUserPost[index].total_like + 1 // Like: Increment total likes
        : Math.max(updatedUserPost[index].total_like - 1, 0); // Dislike: Decrement total likes but ensure it doesn't go below 0
      // Clear emoji if dislike
      if (!updatedUserPost[index].is_like) {
        updatedUserPost[index].emoji = null;
      }
      this.setState({
        userPost: updatedUserPost,
      });
      if (this.state.fullScreenView) {
        const updatedViewPost = {...this.state.viewPost};
        updatedViewPost.is_like = !updatedViewPost.is_like;
        updatedViewPost.total_like = updatedViewPost.is_like
          ? updatedViewPost.total_like + 1
          : Math.max(updatedViewPost.total_like - 1, 0); // Same logic for viewPost
        this.setState({viewPost: updatedViewPost});
      }
    } else {
      // Update the search data similarly
      const updatedSearchData = {...this.state.searchData};
      updatedSearchData.posts[index].is_like =
        !updatedSearchData.posts[index].is_like;
      updatedSearchData.posts[index].total_like = updatedSearchData.posts[index]
        .is_like
        ? updatedSearchData.posts[index].total_like + 1 // Like: Increment total likes
        : Math.max(updatedSearchData.posts[index].total_like - 1, 0); // Dislike: Decrement total likes but ensure it doesn't go below 0
      this.setState({searchData: updatedSearchData});
    }
    await this.props.postLikeShareSave(item?.id, 'like');
  };

  //post comment like
  commentLikePress = async (item, index, i) => {
    try {
      this.state.userPost[index].comments[i].is_like =
        !this.state.userPost[index].comments[i].is_like;
      this.setState({userPost: this.state.userPost});
      await this.props.commentLike(item);
    } catch (error) {
      this.setState({loading: false});
    }
  };

  //open comment view
  onCommentPress = (item, index) => {
    this.state.userPost[index].commentOpen =
      !this.state.userPost[index].commentOpen;
    this.setState({userPost: this.state.userPost});
  };

  //post comment send
  sendComment = async (item, index) => {
    const {allData} = this.props;
    this.postOptionClose();
    this.props.isPostLoading(true);
    try {
      var commentdata = await this.props.postCommentSend(
        item?.id,
        item?.commentTxt,
      );
      this.props.isPostLoading(false);
      var allPostDetail = allData;
      const postIndex = allPostDetail?.data.findIndex(d => d.id === item?.id);
      allPostDetail.data[postIndex].comments = [
        commentdata?.data,
        ...allPostDetail?.data[postIndex].comments,
      ];
      allPostDetail.data[postIndex].total_comment =
        allPostDetail?.data[postIndex].total_comment + 1;
      this.props.getPostLocally(allPostDetail);
      this.props.isPostLoading(false);
      this.setState({
        userPost: allPostDetail?.data,
      });
    } catch (error) {
      this.props.isPostLoading(false);
      this.setState({loading: false});
    }
    this.setState({
      commonText: '',
      isEmojiKeyboard: false,
      isEmojiKeyboardC: false,
    });
    // Keyboard.dismiss();
  };

  //timeline in add new post
  handleSendPost = async () => {
    const {allData} = this.props;
    Keyboard.dismiss();
    if (!this.state.groupName) {
      Alert.alert(getLocalText('ErrorMsgs.selectgroup'));
    } else {
      const postRes = await this.props.addPost(
        this.state.postText,
        this.state.attachImages,
        1,
        this.state.groupName.id,
      );

      if (!postRes.error) {
        var allPostDetail = allData;
        allPostDetail = {
          ...allPostDetail,
          data: [postRes?.data, ...allPostDetail?.data],
        };

        this.props.getPostLocally(allPostDetail);
        this.props.isPostLoading(false);

        this.setState({
          userPost: allPostDetail?.data,
          postText: '',
          attachImages: [],
          isEmojiKeyboard: false,
          isEmojiKeyboardC: false,
          groupName: '',
        });
      }

      this.props.isPostLoading(false);
    }
  };

  safeEmojiBackspace = str => {
    let initialRealCount = this.fancyCount(str);
    while (str.length > 0 && this.fancyCount(str) !== initialRealCount - 1) {
      str = str.substring(0, str.length - 1);
    }
    return str;
  };
  fancyCount = str => {
    const joiner = '\u{200D}';
    const split = str.split(joiner);
    let count = 0;
    for (const s of split) {
      //removing the variation selectors
      const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join('')).length;
      count += num;
    }
    //assuming the joiners are used appropriately
    return count / split.length;
  };

  handleGroup = async group => {
    if (group !== '' || group !== 'undefined') {
      setTimeout(() => {
        this.setState({groupShowModel: false, groupName: group});
      }, 120);
    }
  };

  scrollUp = () => {
    this.FlatListRef.scrollToOffset({animated: true, page: 0});
  };

  handleMediaOptions = () => {
    this.setState({mediaOption: !this.state.mediaOption});
  };

  postCommentViewHandle = () => {
    this.setState({postCommentView: true});
  };

  handlePostCommentClose = () => {
    this.setState({postCommentView: false});
  };

  postShareHandle = () => {
    this.setState({shareOptionsModel: true, shareData: this.state.viewPost});
  };

  onShare = async (item, index) => {
    this.postOptionClose();
    this.setState({shareOptionsModel: true, shareData: item});
  };

  handleShare = async item => {
    const link = DeepLink + `?type=timeline&id=` + item?.item?.id;
    Share.open({url: link});
    try {
      await this.props.postLikeShareSave(item?.item?.id, 'share');
    } catch (error) {
      this.setState({loading: false});
    }
  };

  handleGroupShare = ids => {
    this.setState({shareGroupsModel: false});
    if (ids != null) {
      this.handleShareMultiple(ids);
    }
  };

  handleShareMultiple = async ids => {
    let pid = this.state.shareData?.item?.id;
    let response = await getAPICall(API.reshared + pid + `/[${ids}]`);
    if (response.success) {
      this.handleRefresh();
    }
  };

  handleImagesClose = () => {
    this.setState({imagesView: false});
  };

  renderSearch = ({item, index}) => {
    return (
      <TouchableOpacity
        style={styles.userView}
        key={index}
        onPress={() => {
          this.redirectToUserDetails(item, item?.id);
        }}>
        <FastImage
          source={{
            uri: item?.user_pic?.optimize,
          }}
          style={styles.userPic}
        />
        <Label
          title={item?.first_name + ' ' + item?.last_name}
          style={{
            marginLeft: scale(13),
          }}
        />
        <View style={styles.subView}>
          <TouchableOpacity
            onPress={() => {
              this.redirectToUserDetails(item, item?.id);
            }}>
            <Icon
              name={'arrow-right'}
              color={theme.colors.blue}
              size={scale(20)}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  renderGroup = ({item, index}) => {
    return (
      <View style={{marginHorizontal: scale(15)}}>
        <GroupCard
          item={item}
          index={index}
          onPress={this.onPressGroupSearch}
          onPressImage={this.onPressImage}
          onPressNotification={() => {}}
          onPressGroup={this.onPressGroupSearch}
        />
      </View>
    );
  };

  onPressImage = (item, index) => {
    this.props.navigation.navigate('GroupMember', {groupData: item});
  };

  renderPost = ({item, index}) => {
    const {searchText, postOption, handleOption, loading, isEmojiKeyboardC} =
      this.state;
    const {reportReasonList, userData} = this.props;

    return (
      <PostCard
        item={item}
        index={index}
        propsValue={this.props}
        onPressEmoji={() => this.handleEmojiKeyboardC(index)}
        onPressKeyboard={() => {
          if (
            this.state.commentedIndex !== index &&
            this.state.commentedIndex !== -1
          ) {
            let postListItem = searchText
              ? this.state?.searchData.posts[this.state?.commentedIndex]
              : this.state.userPost[this.state?.commentedIndex];
            postListItem.commentTxt = '';
            this.setState({
              isEmojiKeyboardC: false,
              commentedIndex: index,
              searchData: this.state.searchData,
              userPost: this.state.userPost,
            });
          }
        }}
        emojiKeyboard={isEmojiKeyboardC}
        onChangeText={text => this.handleCommentTxt(text, item, index)}
        color={item?.commentTxt?.trim().length > 0 ? false : true}
        value={item?.commentTxt}
        onPressSend={this.sendComment}
        userImg={userData?.user_pic?.optimize}
        handlePostModal={this.handlePostModal}
        onLikePress={this.onLikePress}
        onCommentPress={this.onCommentPress}
        postId={postOption}
        showOption={searchText.length === 0 ? true : false}
        optionsIconColor={handleOption}
        onSharePress={this.onShare}
        openImageView={this.handleImagesView}
        onPressCommentLike={this.commentLikePress}
        onPressGroup={this.onPressGroup}
        onPressProfile={() => this.onPressProfile(item)}
        updateCommentCount={this.updateCommentCount}
        closePopup={this.handlPopUpAction}
        userData={userData}
        onPressSharePost={() => this.onPressProfile(item)}
        timeline={true}
        showStatic={true}
        onPressHastag={this.onPressHastag}
        hashTag
        updateCom={this.updateFeed}
        handleMsgPopUp={this.handleMsgPopUp}
        handlePostLike={this.handlePressLike}
        reportReasonList={reportReasonList}
      />
    );
  };

  handleMsgPopUp = async item => {
    const {userData, navigation} = this.props;
    const userID = item?.user_id;
    if (userID !== userData?.id) {
      let chatResponse = await getAPICall(API.chat + userID);
      navigation.navigate('Chat', {
        data: chatResponse?.data,
        singleChat: '1',
      });
    }
  };

  //handle popup
  handlPopUpAction = (id, data) => {
    const {navigation} = this.props;
    const navigateScreen = id === 0 ? 'Chat' : 'AudioCall';
    navigation.navigate(navigateScreen, {
      userData: data,
    });
  };

  updateCommentCount = index => {
    const {allData} = this.props;
    var allPostDetail = allData;
    allPostDetail.data[index].total_comment =
      allPostDetail?.data[index].total_comment + 1;
    this.setState({userPost: allPostDetail?.data});
    this.props.getPostLocally(allPostDetail);
  };

  onPressProfile = async (item, index) => {
    this.redirectToUserDetails(item, item?.user_id);
  };

  redirectToUserDetails = async (item, userId) => {
    const {navigation} = this.props;
    navigation.navigate('UserDataSpecific', {
      data: item?.user_id ? item?.user_id : item,
      id: userId,
      screenName: SCREEN_TYPE.NEW_USER,
    });
  };

  onPressGroup = (item, index) => {
    const {navigation} = this.props;
    navigation.navigate('GroupDetails', {
      item: {groupData: item?.group, joined: false},
    });
  };

  onPressHastag = tag => {
    this.setState({searchText: tag});
    this.handleSearch(2);
  };

  handleImagesView = (item, index, data) => {
    if (item?.post_attachment.length >= 3) {
      this.setState(prevState => {
        return {
          ...prevState,
          imagesView: !prevState.imagesView,
          postDetails: item,
        };
      });
    } else {
      this.setState(prevState => {
        return {
          ...prevState,
          viewPost: item,
          userImagePost: data,
          fullScreenView: !prevState.fullScreenView,
          viewPostIndex: index,
        };
      });
    }
  };

  handleEmojiKeboard = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        isEmojiKeyboard: !prevState.isEmojiKeyboard,
      };
    });
  };

  handleEmojiKeyboardC = index => {
    Keyboard.dismiss();
    this.setState(prevState => {
      return {
        ...prevState,
        isEmojiKeyboardC: !prevState.isEmojiKeyboardC,
        commentedIndex: index,
      };
    });
  };

  updateFeed = async () => {
    const {allData} = this.props;
    await this.props.getPost(1, 0);
    this.setState({
      userPost: allData?.data || [],
      page: 1,
      lastPostId: allData.last_message_id || 0,
    });
  };

  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});
    await this.props.getPost(1, 0);
    this.getSponsorAlert();
    this.handleGroup();
    const {load, allData} = this.props;
    this.setState(prevState => {
      return {
        ...prevState,
        refreshing: load ? false : !prevState.refreshing,
        page: 1,
        userPost: allData && allData?.data?.length > 0 ? allData?.data : [],
        lastPostId: allData.last_message_id || 0,
      };
    });
  };

  handlePostClose = () => {
    this.setState({commentView: !this.state.commentView});
  };
  notificationPress = async () => {
    const {navigation} = this.props;
    navigation.navigate('Notification');
  };

  //close search model
  searchClose = item => {
    if (item) {
      this.setState({searchModel: false});
      this.redirectToUserDetails(item, item?.id);
    } else {
      this.setState({searchModel: !this.state.searchModel});
    }
  };

  handleShareOption = async data => {
    this.setState({shareOptionsModel: false});
    if (data !== '-1') {
      if (data) {
        setTimeout(() => {
          this.setState({shareGroupsModel: true});
        }, 600);
      } else {
        setTimeout(() => {
          this.handleShare(this.state.shareData);
        }, 500);
      }
    }
  };

  handleGroupShow = async () => {
    this.setState({groupShowModel: true});
  };

  handleSearch = async d => {
    await this.setState({selectSearch: d});
    let searchtxt = this.state.searchText;
    let type = this.state.selectSearch;
    let searchType =
      type === 1 ? 'user' : type === 2 ? 'post' : type === 3 ? 'group' : '';

    if (searchtxt !== '' && type !== null) {
      try {
        let frmdata = new FormData();
        frmdata.append('search', searchtxt);
        frmdata.append('type', searchType);
        let searchRes = await postAPICall(API.search, frmdata);
        if (searchRes.success) {
          this.setState({searchData: searchRes?.data});
        }
      } catch (error) {}
    }
  };
  onPressGroupSearch = (item, index) => {
    const {navigation} = this.props;
    navigation.navigate('GroupDetails', {
      item: {groupData: item, joined: item?.joined},
    });
  };

  onViewableItemsChanged = async ({viewableItems, changed}) => {
    console.log('viewableItems...', viewableItems);

    try {
      if (viewableItems.length !== 0) {
        let frmData = new FormData();
        viewableItems.forEach(element => {
          frmData.append('post_id[]', element?.item?.id);
        });
        console.log('frmData...', frmData);

        const res = await postAPICall(API.getStoreUserLog, frmData);
        console.log('res->', res);
      }
    } catch (error) {
      console.log('error --->', error);
    }
  };

  takeVideoPhoto = async type => {
    try {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        mediaType: type,
        // cropping: true,
        compressImageQuality: 0.3,
      }).then(image => {
        const imageRes = imageData(image.path);
        this.setState({
          attachImages:
            type === 'video'
              ? [
                  ...this.state.attachImages,
                  {
                    video: {
                      uri: image?.path,
                      name: imageRes?.name,
                      type: image?.mime,
                    },
                  },
                ]
              : [{uri: image.path, type: 'image/jpeg', name: image.name}],
          cameraModel: !this.state.cameraModel,
        });
      });
    } catch (error) {
      console.log('Take video error', error);
    }
  };

  render() {
    const {
      isEmojiKeyboard,
      isEmojiKeyboardC,
      groupName,
      paymentModel,
      sponsorModel,
      searchModel,
      popUpModel,
      loading,
      searchText,
      refreshing,
      selectSearch,
      searchData,
      postCommentView,
      postOptionIndex,
      postOption,
      userPost,
      postLikeOptionIndex,
      postLikeOption,
      paymentCardData,
      perfectModel,
      perfectModel2,
      isOwnPost,
      exitGroupModel,
      postDeleteModel,
      postPone,
      cameraModel,
      selectedPost,
      postText,
      groupShowModel,
      attachImages,
      postDetails,
      imagesView,
      openLoader,
      viewPost,
      viewPostIndex,
      userImagePost,
      fullScreenView,
      isShowSponsorAlert: isShowSponserAlert,
      shareGroupsModel,
      sponsorAlertList: sponserAlertList,
      shareOptionsModel,
      bodyColor,
      mediaOption,
      isSponsoredByLoggedInUser,
    } = this.state;
    const {
      notificationBell,
      userData,
      getJoinedGroupsList,
      groupCount,
      error,
      load,
    } = this.props;

    return (
      <View style={externalStyles.container}>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <LinearGradient colors={bodyColor} style={styles.linearView}>
          <SearchBar
            {...this.props}
            onNotificationPress={() => {
              this.notificationPress();
            }}
            bellColor={
              notificationBell ? theme.colors.blue : theme.colors.darkGrey
            }
            notificationBadge={notificationBell}
            onSearchPress={() => {
              this.setState({
                searchText: '',
                searchData: [],
                isEmojiKeyboard: false,
              });
            }}
            onFocus={() => {
              this.setState({isEmojiKeyboard: false});
            }}
            isTabshow
            customSearch
            category={d => {
              this.handleSearch(d);
            }}
            searchText={searchText}
            onSearchText={txt => {
              this.setState({
                searchText: txt,
                isEmojiKeyboard: false,
              });
              this.handleSearch(selectSearch);
            }}
          />

          {searchText ? (
            <View>
              <View style={[styles.row, {paddingHorizontal: scale(15)}]}>
                <TouchableOpacity
                  onPress={() => {
                    this.setState({searchText: ''});
                  }}>
                  <Icon
                    name="arrow-left"
                    size={scale(22)}
                    color={theme.colors.blue}
                  />
                </TouchableOpacity>
                <Label
                  title={` ${getLocalText(
                    'Timeline.searchResult',
                  )} ${searchText} in ${
                    selectSearch === 1
                      ? getLocalText('GroupInfo.user')
                      : selectSearch === 2
                      ? getLocalText('GroupInfo.post')
                      : selectSearch === 3
                      ? getLocalText('UserData.group')
                      : ''
                  }`}
                  style={{marginLeft: scale(5)}}
                />
              </View>

              <View style={styles.searchPost}>
                <FlatList
                  ref={ref => (this.FlatListRef = ref)}
                  contentContainerStyle={{
                    paddingBottom: theme.SCREENHEIGHT * 0.1,
                    backgroundColor: theme.colors.transparent,
                  }}
                  keyExtractor={(_, index) => index.toString()}
                  data={
                    selectSearch === 1
                      ? searchData?.users
                      : selectSearch === 2
                      ? searchData.posts
                      : selectSearch === 3 && searchData?.groups
                  }
                  extraData={[this.state, this.props]}
                  renderItem={
                    selectSearch === 1
                      ? this.renderSearch
                      : selectSearch === 2
                      ? this.renderPost
                      : selectSearch === 3 && this.renderGroup
                  }
                />
              </View>
              {/* ) : selectSearch === 3 ? (
                <ScrollView
                  style={{
                    marginTop: scale(10),
                    paddingHorizontal: scale(10),
                  }}>
                  {searchData &&
                    searchData?.groups?.map((item, index) => {
                      return (
                        <GroupCard
                          item={item}
                          index={index}
                          onPress={this.onPressGroupSearch}
                          onPressNotification={() => {}}
                          onPressGroup={this.onPressGroupSearch}
                        />
                      );
                    })}
                </ScrollView>
              ) : null} */}
            </View>
          ) : (
            <>
              <PostBar
                profilePic={userData?.user_pic?.original}
                onPressEmoji={() => {
                  this.handleEmojiKeboard();
                  Keyboard.dismiss();
                }}
                onPressKeyboard={() => {
                  this.setState({
                    isEmojiKeyboard: false,
                  });
                }}
                style={{marginTop: scale(10)}}
                onPressAttachment={() => this.handleMediaOptions()}
                onPressSend={
                  postText.trim().length > 0 || attachImages.length > 0
                    ? this.handleSendPost
                    : null
                }
                sendColor={
                  postText.trim().length > 0 || attachImages.length
                    ? true
                    : false
                }
                removeImage={this.removeImage}
                {...this.state}
                onChangeText={text => {
                  this.handlePostTxt(text);
                }}
                value={postText}
                emojiKeyboard={isEmojiKeyboard}
                ShowGroup={() => this.handleGroupShow()}
                group={groupName}
              />

              {mediaOption ? (
                <MediaOptions
                  isVisible={mediaOption}
                  onPressCamera={() => {
                    this.setState({
                      cameraModel: !this.state.cameraModel,
                      mediaOption: false,
                    });
                  }}
                  onPressGallery={() => {
                    this.handleMediaOptions();
                    setTimeout(() => {
                      this.openImagePicker();
                    }, 500);
                  }}
                  onPressVideo={() => {
                    this.handleMediaOptions();
                    setTimeout(() => {
                      this.openVideoPicker();
                    }, 500);
                  }}
                  onPressFile={() => {
                    this.openFile();
                  }}
                  close={() => {
                    this.handleMediaOptions();
                  }}
                />
              ) : null}
              <CameraVideoPhoto
                isVisible={cameraModel}
                onPressCamera={() => {
                  this.takeVideoPhoto('photo');
                }}
                onPressVideo={() => {
                  this.takeVideoPhoto('video');
                }}
                close={() => {
                  this.setState({cameraModel: !this.state.cameraModel});
                }}
              />
              <View style={styles.dayView}>
                <Icon
                  name="trending-up"
                  size={scale(16)}
                  color={theme.colors.blue}
                />
                <Label
                  title={getLocalText('Post.todayTrand')}
                  style={styles.trendsText}
                />
                <TouchableOpacity
                  style={styles.helpIcon}
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
                title={getLocalText('Information.globalNewstitle')}
                description={getLocalText('Information.globalNewsdisc')}
                close={this.handlePopUpModel}
              />

              {loading ? (
                <ScrollView>
                  {[1, 2].map((_, i) => (
                    <View key={i.toString()} style={[styles.postCard]}>
                      <Loading />
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <FlatList
                  ref={ref => (this.FlatListRef = ref)}
                  contentContainerStyle={{
                    paddingBottom: scale(10),
                    backgroundColor: theme.colors.transparent,
                  }}
                  keyExtractor={(_, index) => index.toString()}
                  data={userPost || []}
                  extraData={[this.state, this.props]}
                  renderItem={this.renderPost}
                  onScroll={e => {
                    postOption ? this.postOptionClose() : '';
                    this.setState({
                      postLikeOptionIndex: '',
                      isEmojiKeyboard: false,
                      isEmojiKeyboardC: false,
                      mediaOption: false,
                    });
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={this.handleRefresh}
                    />
                  }
                  ListEmptyComponent={() => {
                    if (!loading) {
                      return (
                        <View style={styles.noUserAlertView}>
                          <Icon1
                            name="emoji-sad"
                            size={36}
                            color={theme.colors.darkGrey}
                          />
                          <Label
                            title={getLocalText('Post.noDataAvailable')}
                            style={styles.noUserText}
                          />
                        </View>
                      );
                    }
                    return null;
                  }}
                  onEndReachedThreshold={0.2}
                  ListFooterComponent={this.renderFooter.bind(this)}
                  onEndReached={this.loadMore}
                  onViewableItemsChanged={this.onViewableItemsChanged}
                  viewabilityConfig={{
                    itemVisiblePercentThreshold: 35,
                    minimumViewTime: 2000,
                  }}
                />
              )}
            </>
          )}
          {postOptionIndex !== '' &&
          postOption === userPost[postOptionIndex].id ? (
            <PostOptions
              {...this.props}
              {...this.state}
              item={userPost[postOptionIndex].id}
              data={userPost[postOptionIndex]}
              isSponsored={userPost[postOptionIndex].is_sponsored}
              handleOptions={this.handleOptions}
              singleOption={false}
              userData={userData}
            />
          ) : null}
          {postLikeOptionIndex !== '' &&
          postLikeOption === userPost[postLikeOptionIndex].id ? (
            <ReactionModel
              {...this.props}
              {...this.state}
              onPressLikeEmoji={this.onPressLikeEmoji}
            />
          ) : null}
          <Sponsor
            isVisible={sponsorModel}
            togglePaymentModal={this.closeSponsorModel}
            selectedPost={selectedPost}
            callInappPurchase={this.closePaymentModal}
          />
          {/* <ShareOptions showModel={true} /> */}
          <PaymentModel
            {...this.props}
            isVisible={paymentModel}
            closeModal={this.closePaymentModal}
            cardData={paymentCardData}
          />
          <PerfectModel
            isVisible={perfectModel}
            close={this.closePerfectModel}
            onRedirect={this.handlePerfectModal}
            isOwnPost={isOwnPost}
          />

          <PerfectModel
            isVisible={perfectModel2}
            close={this.closePerfectModel2}
            // onRedirect={this.closePerfectModel2}
            isSponsoredByLoggedInUser={isSponsoredByLoggedInUser}
          />

          <ConfirmationModel
            isVisible={exitGroupModel || postDeleteModel}
            type={exitGroupModel ? 'groupexit' : 'post'}
            close={
              exitGroupModel ? this.exitGroupAction : this.deletepostAction
            }
          />
          <PostponedModel
            isVisible={postPone}
            close={this.closePostpone}
            postData={selectedPost}
          />
          <EmojiPicker
            onEmojiSelected={this.setEmoji}
            open={isEmojiKeyboardC || isEmojiKeyboard}
            onClose={() =>
              this.setState({isEmojiKeyboard: false, isEmojiKeyboardC: false})
            }
          />
          {/* <EmojiBoard
            showBoard={isEmojiKeyboardC || isEmojiKeyboard}
            onClick={this.setEmoji}
            onEmojiPicked={e =>
              this.setState({emojis: this.state.emojis.concat(e)})
            }
            //  onEmojiRemoved={e => this.setState({emojis: this.state.emojis.slice(0, -1)})}
            showDeleteButton={isEmojiKeyboard.length > 0}
            onRemove={() => {
              var str;
              if (isEmojiKeyboardC) {
                if (this.state.searchText) {
                  let commentItem =
                    this.state.searchData.posts[this.state?.commentedIndex];
                  str = this.safeEmojiBackspace(commentItem.commentTxt);
                  commentItem.commentTxt = str;

                  this.setState({searchData: this.state.searchData});
                } else {
                  let commentItem =
                    this.state.userPost[this.state?.commentedIndex];

                  str = this.safeEmojiBackspace(commentItem.commentTxt);
                  commentItem.commentTxt = str;

                  this.setState({userPost: this.state.userPost});
                }

                this.setState({commonText: str});
              }
              if (isEmojiKeyboard) {
                str = this.safeEmojiBackspace(postText);
                this.setState({postText: str});
              }
            }}
            onClose={() =>
              this.setState({
                isEmojiKeyboard: false,
                isEmojiKeyboardC: false,
              })
            }
          /> */}

          <GroupsJoinedModel
            isShow={groupShowModel}
            handleGroup={this.handleGroup}
            groups={this.props.getJoinedGroupsList}
            attachLength={attachImages.length}
            groupStyle={{
              marginTop:
                groupCount === 1 || groupCount === 2 || groupCount === 0
                  ? -theme.SCREENHEIGHT * 0.35
                  : -theme.SCREENHEIGHT * 0.05,
            }}
          />
          <GalleryModel isVisible={false} />
          <ImagesViewModel
            item={postDetails}
            isVisible={imagesView}
            close={this.handleImagesClose}
            onPressLike={this.onLikePress}
            user={userData}
            handleRefresh={this.handleRefresh}
            onPressComment={this.handleImagesClose}
            onPressProfile={() => this.onPressProfile(postDetails)}
            onPressGroup={this.onPressGroup}
          />
          <SearchModel isVisible={searchModel} closeSearch={this.searchClose} />
          {error ? null : load || openLoader ? (
            <Loader loading={load || openLoader} />
          ) : null}
        </LinearGradient>
        <OfflineModel />
        {fullScreenView ? (
          <PostViewerModel
            isShow={fullScreenView}
            postImages={viewPost}
            userImagePost={userImagePost}
            closeModel={() => {
              this.setState({fullScreenView: false});
            }}
            onLikePress={this.onLikePress}
            postIndex={viewPostIndex}
            onCommentPress={() => {
              this.setState({fullScreenView: false}, () =>
                this.postCommentViewHandle(),
              );
            }}
            onPressShare={() => {
              this.setState({fullScreenView: false}, () =>
                this.postShareHandle(),
              );
            }}
          />
        ) : null}
        <ShareOptions
          showModel={shareOptionsModel}
          handleClose={this.handleShareOption}
        />
        <ContentSponsorModel
          show={isShowSponserAlert}
          closeModal={() => this.setState({isShowSponserAlert: false})}
          submit={type => this.handleSponsorStatus(type)}
          sponserData={sponserAlertList}
        />
        <SharePostGroupModel
          show={shareGroupsModel}
          closeModal={this.handleGroupShare}
        />
        <PostsCommentModel
          isVisible={postCommentView}
          close={this.handlePostCommentClose}
          data={viewPost}
          index={viewPostIndex}
          userImg={userData?.user_pic?.optimize}
          timeline={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.25),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '75deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.45),
    left: -(theme.SCREENHEIGHT * 0.42),
    transform: [{rotate: '75deg'}],
  },
  dayView: {
    flexDirection: 'row',
    marginLeft: scale(18),
    alignItems: 'center',
    marginTop: scale(16),
    marginBottom: scale(7),
  },
  trendsText: {
    marginLeft: scale(10),
  },
  helpIcon: {
    left: scale(11),
  },
  searchPost: {
    height: theme.SCREENHEIGHT * 0.65,
    width: '100%',
    marginTop: scale(10),
  },
  postCard: {
    marginHorizontal: scale(18),
    borderRadius: scale(9),
    padding: scale(11),
    marginBottom: scale(11),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.2,
    elevation: 1,
    backgroundColor: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
    marginHorizontal: scale(15),
  },
  userPic: {
    height: scale(50),
    width: scale(50),
    resizeMode: 'cover',
    borderRadius: scale(25),
  },
  subView: {
    position: 'absolute',
    right: scale(0),
  },
  noUserAlertView: {
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    width: '90%',
    height: theme.SCREENHEIGHT * 0.4,
    alignSelf: 'center',
    borderRadius: 10,
    justifyContent: 'center',
  },
  noUserText: {
    marginTop: 10,
  },
  linearView: {
    flex: 1,
    backgroundColor: theme.colors.transparent,
  },
});

const mapStateToProps = state => {
  const userData = state.UserInfo.data;
  const allData = state.PostReducer.getData;
  const load = state.PostReducer.load;
  const fetchPost = state.PostReducer.getPostLoad;
  const isPostLike = state.PostReducer.postLike;
  const reportResponse = state.PostReducer.report;
  const isCommentLike = state.PostReducer.commentLike;
  const errorStatus = state.PostReducer?.errorMsg;
  const groupCount = state.UserInfo.joinGroupCount;
  const getJoinedGroupsList = state.groupsReducer.joinGroup_list;
  const loginStatus = state.AppReducer.loginstatus;
  const notificationBell = state.UserInfo.notificationBellIcon;
  const reportReasonList = state.PostReducer.reportReasonList;
  const getNewPostBadge = state.UserInfo.newPostBadge;

  return {
    userData,
    allData,
    load,
    fetchPost,
    isPostLike,
    errorStatus,
    groupCount,
    getJoinedGroupsList,
    isCommentLike,
    reportResponse,
    loginStatus,
    notificationBell,
    reportReasonList,
    getNewPostBadge,
  };
};

export default connect(mapStateToProps, {
  getPost,
  getPostLocally,
  addPost,
  isPostLoading,
  postCommentSend,
  postLikeShareSave,
  commentLike,
  exitGroup,
  getJoinedGroups,
  blockAction,
  isLogin,
  logout,
  susPendNotification,
  makeSponsorPost,
  setNotificationBellIcon,
  getReportReasonList,
  setNewPostBadge,
  setNewChatBadge,
})(Timeline);
