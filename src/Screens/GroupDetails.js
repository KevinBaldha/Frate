/* eslint-disable no-dupe-class-members */
import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Feather';
// import EmojiBoard from './EmojiBoard';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {
  ScreenContainer,
  BackgroundChunk,
  SearchBar,
  PostCard,
  Label,
  Button,
  Menus,
  MessageCard,
  PostBar,
  ReportModel,
  ReportDetailsModel,
  PostponedModel,
  MediaOptions,
  Loader,
  HeaderView,
  AddConversionsMembersModel,
  SearchModel,
  GroupCard,
  ShareOptions,
  SharePostGroupModel,
  ConfirmationModel,
  PostOptions,
  PostViewerModel,
  PopUpModel,
  OfflineModel,
  ReactionModel,
  Sponsor,
  PaymentModel,
  PerfectModel,
  PostsCommentModel,
} from '../Components';
import {theme, scale, imagesOptions, Config, Api, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {imageData} from '../Utils/helper';
import externalStyle from '../Css';
import {
  addPost,
  isPostLoading,
  postLikeShareSave,
  postCommentSend,
  commentLike,
  exitGroup,
  reportGroup,
  manageNotification,
  getJoinGroupCount,
  CreatedGroupCount,
  getGroupPost,
  getGroupRoom,
  getGroupRoomAudio,
  getJoinedGroups,
} from '../Redux/Actions';
import {API, deleteAPICall, getAPICall, postAPICall} from '../Utils/appApi';
import {BLOCKTYPES, DeepLink, SCREEN_TYPE} from '../Utils/StaticData';
import CameraVideoPhoto from '../Components/CameraVideoPhoto';
import EmojiPicker from 'rn-emoji-keyboard';
let loadMoreData = false;
let loadRoomData = false;
let loadAudioData = false;
class GroupDetails extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      searchText: '',
      selectSearch: null,
      searchData: [],
      file: '',
      joined: this.props.route.params.item?.joined,
      groupName: this.props.route.params.item?.groupData.name,
      fillterItems: [
        {
          id: 1,
          icon: '',
          title: getLocalText('Group.fillterbtn1'),
        },
        {
          id: 2,
          icon: 'help-circle',
          title: getLocalText('Group.fillterbtn2'),
        },
        {
          id: 3,
          icon: 'help-circle',
          title: getLocalText('Group.fillterbtn3'),
        },
      ],
      menu: false,
      hadleAddMember: false,
      groupOptions: [
        {icon: 'info', name: getLocalText('Chat.groupinfo')},
        {icon: 'bell', name: getLocalText('Chat.notification')},
        {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
      ],
      options1: [
        {icon: 'info', name: getLocalText('Chat.groupinfo')},
        {icon: 'bell', name: getLocalText('Chat.notification')},
        {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        // {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
      ],
      options2: [
        {icon: 'info', name: getLocalText('Chat.groupinfo')},
        {icon: 'bell', name: getLocalText('Chat.notification')},
        {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        // {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
        {icon: 'delete-outline', name: getLocalText('GroupInfo.delete')},
      ],
      options: [
        {icon: 'bookmark', name: getLocalText('Timeline.save')},
        // {icon: 'bell', name: getLocalText('Timeline.suspendnotification')},
        // {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        {icon: 'eye-off', name: getLocalText('Timeline.hide')},
        {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
        // {icon: 'copy', name: getLocalText('Timeline.copylink')},
        {icon: 'corner-right-up', name: getLocalText('Post.reshare')},
        {icon: 'trash-2', name: getLocalText('Timeline.delete')},
        // {icon: 'trending-up', name: getLocalText('Timeline.seestatic')},
      ],
      likOption: [
        {icon: images.likeEmoji},
        {icon: images.heartEmoji},
        {icon: images.clapEmoji},
        {icon: images.happyEmoji},
        {icon: images.angryEmoji},
      ],
      roomList: [],
      groupPosts: [],
      audioDiscussionList: [],
      deleteModel: false,
      commenttxt: '',
      groupjoin: false,
      category: 1,
      isEmojiKeyboard: false,
      isEmojiKeyboardC: false,
      postText: '',
      attachImages: [],
      reportModel: false,
      reportDetails: false,
      postPone: false,
      time: '',
      postOption: '',
      mediaOption: false,
      viewPostIndex: -1,
      cameraModel: false,
      loadding: false,
      refreshing: false,
      refreshChatRoom: false,
      audioRefreshing: false,
      loadmore: false,
      loadRoom: false,
      loadAudio: false,
      page: 1,
      chatPage: 1,
      audioPage: 1,
      totalPage: 1,
      roomTotalPage: 1,
      audioRoomTotalPage: 1,
      perPageData: 0,
      memberPage: 1,
      memberTotalPage: 1,
      openAddMemberType: '',
      membersList: [],
      searchModel: false,
      joinBtnPress: false,
      shareOptionsModel: false,
      shareData: [],
      shareGroupsModel: false,
      postOptionIndex: '',
      selectedPost: '',
      exitGroupModel: false,
      postDeleteModel: false,
      fullScreenView: false,
      popUpModel: false,
      tabId: null,
      viewPost: [],
      userImagePost: [],
      disabledButton: false,
      postLikeOption: '',
      postLikeOptionIndex: '',
      indicatorOffsetForLike: 0,
      sponsorModel: false,
      sponsorData: '',
      paymentModel: false,
      perfectModel: false,
      paymentCardData: [],
      postCommentView: false,
      groupDetailsData: this.props.route.params.item?.groupData,
      lastPostId: 0,
      lastChatRoomId: 0,
      lastAudioRoomId: 0,
      groupMemberPage: 1,
      groupMemberTotalPage: 1,
      groupMemberParPageData: 0,
    };
    this._keyboardDidShow = this._keyboardDidShow.bind(this);
    this._keyboardDidHide = this._keyboardDidHide.bind(this);
  }

  componentDidMount() {
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );
    this.groupPosts(); // Feed list
    this.getChatRoomList(); // Chat room
    this.getAudioRooms(); // Audio Room
    this.getGroupUserList();
    this.props.isPostLoading(0);
    if (this.props.route?.params?.item?.category === 3) {
      this.setState({category: 3});
    }
  }

  //get group posts
  groupPosts = async (isRefresh = false) => {
    let getPostData;
    if (this.props.route.params.item?.notification) {
      let postId = this.props.route.params.item?.redirect_id;
      getPostData = await getAPICall(API.getSinglePost + postId);
    }

    this.setState({loadding: !isRefresh, page: 1});
    try {
      let groupPostResponse = await this.getGroupPostApi(1, 0);
      this.setState({refreshing: false});
      if (groupPostResponse.success) {
        this.setState({
          groupPosts: groupPostResponse.data
            ? this.state.joined
              ? this.props.route.params.item?.notification
                ? [getPostData.data, ...groupPostResponse.data]
                : groupPostResponse.data
              : groupPostResponse.data.slice(0, 2)
            : [],
          totalPage: groupPostResponse.total_page,
          perPageData: groupPostResponse?.per_page_data,
          loadding: false,
          lastPostId: groupPostResponse.last_message_id,
        });
      } else {
        Alert.alert(groupPostResponse.errorMsg.message);
        this.setState({loadding: false, refreshing: false});
      }
    } catch (error) {
      this.setState({loadding: false, refreshing: false});
    }
  };

  // posts
  getGroupPostApi = async (page, lastId) => {
    const {groupDetailsData} = this.state;
    const redirectId = this.props.route.params.item?.notification;
    let group_id = groupDetailsData?.id;
    let groupPostResponse = await this.props.getGroupPost(
      page,
      group_id,
      lastId,
      redirectId ? this.props.route.params.item?.redirect_id : '',
    );
    return groupPostResponse;
  };

  //next page posts
  loadMoreGroup = async () => {
    if (this.state.groupPosts) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let groupPost = await this.getGroupPostApi(
            page,
            this.state.lastPostId,
          );
          // let data = [...this.state.groupPosts, ...groupPost.data];
          if (groupPost.success) {
            this.setState({
              groupPosts: this.props.getGroupDataList.data,
              loadmore: false,
              page: page,
            });
            loadMoreData = false;
          }
        }
      } else {
        this.setState({loadmore: false});
      }
    }
  };

  // refresh posts
  handleRefresh = async () => {
    if (this.state.joined) {
      this.setState({refreshing: true});
      this.groupPosts(true);
    }
  };

  // room list
  getChatRoomList = async (isRefresh = false) => {
    // Group chat list
    this.setState({chatPage: 1, loadding: !isRefresh});
    try {
      let groupChat = await this.getChatRoomListApi(1, 0);
      this.setState({loadding: false, refreshChatRoom: false});
      if (groupChat.success) {
        this.setState({
          roomList: groupChat.data,
          roomTotalPage: groupChat.total_page,
          lastChatRoomId: groupChat.last_message_id,
        });
      }
    } catch (e) {
      this.setState({loadding: false, refreshChatRoom: false});
    }
  };

  // room api
  getChatRoomListApi = async (page, lastId) => {
    const {groupDetailsData} = this.state;
    let group_id = groupDetailsData?.id;
    const groupChat = await this.props.getGroupRoom(page, group_id, lastId);
    return groupChat;
  };

  // load more room list
  loadMoreRoom = async () => {
    if (this.state.roomList) {
      if (this.state.chatPage <= this.state.roomTotalPage && !loadRoomData) {
        let page = this.state.chatPage + 1;
        if (page < this.state.roomTotalPage) {
          this.setState({loadRoom: true});
          loadRoomData = true;
          let groupChat = await this.getChatRoomListApi(
            page,
            this.state.lastChatRoomId,
          );
          if (groupChat.success) {
            // let data = [...this.state.roomList, ...groupChat.data];
            this.setState({
              roomList: this.props.getGroupChatRoomData.data,
              loadRoom: false,
              chatPage: page,
            });
            loadRoomData = false;
          }
        }
      } else {
        this.setState({loadRoom: false});
      }
    }
  };

  handleRefreshChatRoom = async () => {
    this.setState({refreshChatRoom: true});
    await this.getGroupUserList();
    this.getChatRoomList(true);
  };

  //get user groups lists
  getGroupUserList = async (isRefresh = false) => {
    this.setState({loadding: !isRefresh, groupMemberPage: 1});
    const {groupDetailsData} = this.state;
    let group_id = groupDetailsData?.id;
    let members = await getAPICall(
      API.groupMembers + group_id + `?page=${this.state.groupMemberPage}`,
    );
    if (members.success) {
      this.setState({
        membersList: members.data,
        groupMemberTotalPage: members.total_page,
        groupMemberParPageData: members.per_page_data,
      });
    }
    return members;
  };

  getAudioRooms = async (isRefresh = false) => {
    this.setState({audioPage: 1, loadding: !isRefresh});
    try {
      let audioRooms = await this.getAudioRoomListApi(1, 0);
      this.setState({loadding: false, audioRefreshing: false});
      if (audioRooms.success) {
        this.setState({
          audioDiscussionList: audioRooms.data,
          audioRoomTotalPage: audioRooms.total_page,
          lastAudioRoomId: audioRooms.last_message_id,
        });
      }
    } catch (e) {
      this.setState({loadding: false, audioRefreshing: false});
    }
  };

  getAudioRoomListApi = async (page, lastId) => {
    const {groupDetailsData} = this.state;
    let group_id = groupDetailsData?.id;
    let responseAudio = await this.props.getGroupRoomAudio(
      page,
      group_id,
      lastId,
    );
    return responseAudio;
  };

  // load more room audio list
  LoadMoreAudioRooms = async () => {
    if (this.state.audioDiscussionList) {
      if (
        this.state.audioPage <= this.state.audioRoomTotalPage &&
        !loadAudioData
      ) {
        let page = this.state.audioPage + 1;
        if (page < this.state.audioRoomTotalPage) {
          this.setState({loadAudio: true});
          loadAudioData = true;
          let groupAudio = await this.getAudioRoomListApi(
            page,
            this.state.lastAudioRoomId,
          );
          if (groupAudio.success) {
            // let data = [...this.state.audioDiscussionList, ...groupAudio.data];
            this.setState({
              audioDiscussionList: this.props.getGroupAudioRoomData.data,
              loadAudio: false,
              audioPage: page,
            });
            loadAudioData = false;
          }
        }
      } else {
        this.setState({loadAudio: false});
      }
    }
  };

  handleRefreshAudioRoom = async () => {
    this.setState({audioRefreshing: true});
    await this.getGroupUserList();
    this.getAudioRooms(true);
  };

  handlePopUpModel = id => {
    this.setState({popUpModel: !this.state.popUpModel, tabId: id});
  };

  handleMenus = index => {
    const {groupDetailsData} = this.state;
    this.setState({menu: !this.state.menu});
    setTimeout(() => {
      if (index === 0) {
        this.props.navigation.navigate('GroupInformation', {
          groupData: groupDetailsData,
          userLists: this.state.roomList,
          totalPage: this.state.memberTotalPage,
          currentPage: this.state.memberPage,
          mediaPost: '2',
        });
      } else if (index === 1) {
        this.props.manageNotification(groupDetailsData?.id);
      } else if (index === 2) {
        this.setState({reportModel: !this.state.reportModel});
      } else if (index === 3) {
        if (this.props.userData.id == groupDetailsData?.group_admin_id) {
          this.setState({deleteModel: true});
        } else {
          this.setState({exitGroupModel: true});
          // this.props.exitGroup(groupDetailsData?.id);
          // this.props.navigation.goBack();
        }
      }
    }, 500);
  };

  //delete group
  deleteGroup = async data => {
    const {groupDetailsData} = this.state;
    this.setState({deleteModel: false});
    if (data == 1) {
      let groupId = groupDetailsData?.id;
      try {
        let deleteGroup = await deleteAPICall(API.groupCreate + '/' + groupId);
        if (deleteGroup.success) {
          this.props.CreatedGroupCount(this.props.created_g_count - 1);
          await this.props.getJoinedGroups(1);
          this.props.navigation.navigate('Timeline');
        } else {
          Alert.alert(deleteGroup);
        }
      } catch (error) {
        Alert.alert(error);
      }
    }
  };

  getAllPaymentCards = async () => {
    try {
      let cards = await getAPICall(API.getAllCards);
      if (cards.success) {
        // setCardList(cards.data);
        this.setState({paymentCardData: cards.data});
        // this.setState({cards: cards?.data, loadding: false});
      } else {
      }
    } catch (error) {}
  };

  handlePostTxt = text => {
    this.setState({postText: text});
  };

  openFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      this.setState({
        attachImages: [
          ...this.state.attachImages,
          {
            pdf: res.uri,
            type: Platform.OS === 'ios' ? 'application/pdf' : res.type,
            name: res.name,
          },
        ],
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
    this.setState({mediaOption: false});
  };

  handleSendPost = async () => {
    const {groupDetailsData} = this.state;
    this.props.isPostLoading(true);
    let groupId = groupDetailsData?.id;
    const postRes = await this.props.addPost(
      this.state.postText,
      this.state.attachImages,
      0,
      groupId,
    );
    if (!postRes.error) {
      const groupPostsNew = [postRes.data, ...this.state.groupPosts];
      this.setState({
        postText: '',
        attachImages: [],
        isEmojiKeyboard: false,
        isEmojiKeyboardC: false,
        groupPosts: groupPostsNew,
        totalPage: Math.ceil(groupPostsNew.length / this.state.perPageData),
      });
    }

    this.props.isPostLoading(false);
  };

  scrollUp = () => {
    this.FlatListRef.scrollToOffset({animated: true, offset: 0});
  };

  openImagePicker = () => {
    ImagePicker.openPicker({
      imagesOptions,
      multiple: true,
    }).then(response => {
      response.map(item => {
        if (item?.mime.slice(0, 5) === 'video') {
          let videoName = imageData(
            Platform.OS === 'ios' ? item?.sourceURL : item?.path,
          );
          this.setState({
            attachImages: [
              ...this.state.attachImages,
              {
                video: {
                  uri: Platform.OS === 'ios' ? item?.sourceURL : item?.path,
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
            600,
            600,
            'PNG',
            80,
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

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    clearInterval(this.Clock);
  }

  _keyboardDidShow() {
    this.setState({isEmojiKeyboard: false, isEmojiKeyboardC: false});
  }

  _keyboardDidHide() {}
  setEmoji = emoji => {
    const key = this.state.isEmojiKeyboard ? 'postText' : 'commenttxt';

    this.setState({[key]: this.state[key] + emoji.emoji});
  };
  removeImage = (item, index) => {
    this.state.attachImages.splice(index, 1);
    this.setState({
      attachImages: this.state.attachImages,
    });
  };

  onPressHastag = tag => {
    this.setState({searchText: tag});
    this.handleSearch(2);
  };

  updateCommentCount = index => {
    this.state.groupPosts[index].total_comment =
      this.state.groupPosts[index].total_comment + 1;
    this.setState({groupPosts: this.state.groupPosts});
  };

  onPressProfile = async (item, index) => {
    this.redirectToUserDetails(item, item?.user_id);
  };

  redirectToUserDetails = async (item, userId) => {
    this.props.navigation.navigate('UserDataSpecific', {
      data: item?.user_id === undefined ? item : item?.user_id,
      id: userId,
      screenName: SCREEN_TYPE.NEW_USER,
    });
  };

  onPressGroup = (item, index) => {
    this.props.navigation.navigate('GroupInformation', {
      groupData: item?.group,
      mediaPost: '2',
    });
  };

  onPressImage = (item, index) => {
    this.props.navigation.navigate('GroupMember', {groupData: item?.group});
  };

  onPressGroupSearch = (item, index) => {
    this.props.navigation.navigate('GroupInformation', {groupData: item});
  };

  onPressMemberSearch = (item, index) => {
    this.props.navigation.navigate('GroupMember', {groupData: item});
  };

  handleImagesView = async (item, index, data) => {
    this.setState({scrollFlat: this.state.scrollFlat + 15});
    setTimeout(async () => {
      this.postOptionClose();
      this.setState({
        viewPost: item,
        userImagePost: data,
        fullScreenView: !this.state.fullScreenView,
        viewPostIndex: index,
      });
    }, 200);
  };

  handleEmojiKeboardC = () => {
    this.setState({isEmojiKeyboardC: !this.state.isEmojiKeyboardC});
  };

  //share post
  onShare = async (item, index) => {
    if (this.state.joined) {
      this.postOptionClose();
      this.setState({shareOptionsModel: true, shareData: item});
    }
  };

  handleCommentTxt = (text, data) => {
    data.commentTxt = text;
    this.setState({searchData: this.state.searchData});
  };

  openVideoPicker = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      multiple: true,
      includeExif: true,
    }).then(video => {
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
                  name: videoName.name,
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

  //like post
  onLikePress = async (item, index) => {
    let {searchText, groupPosts, joined} = this.state;
    if (joined) {
      if (searchText === '') {
        groupPosts[index].is_like = !groupPosts[index].is_like;
        groupPosts[index].total_like = groupPosts[index].is_like
          ? groupPosts[index].total_like + 1
          : groupPosts[index].total_like - 1;

        if (!groupPosts[index].is_like) {
          groupPosts[index].emoji = null;
        }

        this.setState({groupPosts: groupPosts});

        if (this.state.fullScreenView) {
          this.setState({viewPost: item});
          this.state.viewPost.is_like = !this.state.viewPost.is_like;

          if (this.state.viewPost) {
            this.state.viewPost[index].total_like = this.state.viewPost?.is_like
              ? this.state.viewPost[index].total_like + 1
              : this.state.viewPost[index].total_like - 1;
          }
          this.setState({viewPost: this.state.viewPost});
        }
      } else {
        this.state.searchData.posts[index].is_like =
          !this.state.searchData.posts[index].is_like;

        this.state.searchData.posts[index].total_like = this.state.searchData
          .posts[index].is_like
          ? this.state.searchData.posts[index].total_like + 1
          : this.state.searchData.posts[index].total_like - 1;
        this.setState({searchData: this.state.searchData});
      }
      await this.props.postLikeShareSave(item?.id, 'like');
    }
  };

  // open comment view
  onCommentPress = (item, index) => {
    if (this.state.joined) {
      this.state.groupPosts.data[index].commentOpen =
        !this.state.groupPosts.data[index].commentOpen;
      this.setState({groupPosts: this.state.groupPosts});
    }
  };

  //Comment Like Press
  onPressCommentLike = (item, index) => {
    try {
      this.props.commentLike(item);
      if (this.props.isCommentLike) {
        this.state.groupPosts.data[index].comments[0].is_like =
          !this.state.groupPosts.data[index].comments[0].is_like;
        this.setState({groupPosts: this.state.groupPosts});
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };

  handleSavePost = async (index, item) => {
    try {
      await this.props.postLikeShareSave(item, 'save');
      this.state.groupPosts[index].is_save =
        !this.state.groupPosts[index].is_save;
      this.setState({groupPosts: this.state.groupPosts});
    } catch (error) {
      this.props.isPostLoading(0);
    }
  };

  handlePostModal = item => {
    this.setState({postOption: item?.id});
  };

  toggleVideoButton = () => {
    this.setState({isPaused: !this.state.isPaused});
  };

  closeSponsorModel = async (data, day, people, amoutPayable) => {
    this.setState(
      {
        sponsorModel: false,
      },
      () => {
        if (data !== 'close') {
          if (data) {
            setTimeout(() => {
              this.setState(
                {
                  sponsorData: {
                    day: day,
                    amount: amoutPayable,
                    people: people,
                  },
                },
                () => this.setState({paymentModel: true}),
              );
            }, 900);
          } else {
            this.setState({paymentModel: true});
          }
        }
      },
    );
  };

  closePaymentModal = async type => {
    const {selectedPost, sponsorData} = this.state;
    let postId = selectedPost?.id,
      persons = sponsorData?.people,
      day = sponsorData?.day,
      amount = sponsorData?.amount;

    this.setState({paymentModel: false});
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
              this.props.navigation.navigate('CardDetail', {
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
        this.setState({loadding: true});
        let makeSponsorForm = new FormData();
        makeSponsorForm.append('post_id', postId);
        makeSponsorForm.append('no_of_people', persons);
        makeSponsorForm.append('days', day);
        makeSponsorForm.append('price', amount ? amount : 0);

        let response = await postAPICall(
          API.makeSponsorPostNew,
          makeSponsorForm,
        );
        this.setState({loadding: false});
        if (response.error) {
          Alert.alert(response?.errorMsg);
        } else {
          if (response.data.user_own_sponser_post) {
            const postIndex = this.state.groupPosts.findIndex(
              d => d.id === postId,
            );
            this.state.groupPosts[postIndex].is_sponsored = 1;
            this.setState({
              groupPosts: this.state.groupPosts,
            });
          }

          setTimeout(() => {
            this.setState({perfectModel: true});
          }, 500);
        }
      } catch (error) {
        this.setState({loadding: false});
      }
    }
  };

  closePerfectModel = async () => {
    this.setState({perfectModel: false});
  };

  handlePerfectModal = async () => {
    this.closePerfectModel();

    this.props.navigation.navigate('Sponsor');
  };

  takeVideoPhoto = async type => {
    try {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        mediaType: type,
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
    } catch (error) {}
  };

  handleOptions = async (index, item, data) => {
    this.setState({selectedPost: data});
    this.postOptionClose();
    if (index === -1) {
      //  open sponsered modal
      this.setState({sponsorModel: !this.state.sponsorModel});

      await this.getAllPaymentCards();
    } else if (index === 0) {
      //save post
      this.handleSavePost(index, item);
    } else if (index === 2) {
      //exit group model
      this.setState({exitGroupModel: true});
    } else if (index === 1) {
      //post hide
      try {
        let postIndex = this.state.postOptionIndex;
        await this.props.postLikeShareSave(item, 'hide');
        this.state.groupPosts.splice(postIndex, 1);
        this.setState({groupPosts: this.state.groupPosts});
      } catch (error) {
        this.setState({loadding: false});
      }
    }
    //handle reshare
    else if (index === 3) {
      let response = await getAPICall(API.reshare + item);
      if (response.success) {
        var findPost = this.state.groupPosts.findIndex(d => d.id === item);
        this.state.groupPosts[findPost].is_reshared =
          !this.state.groupPosts[findPost].is_reshared;
        this.setState({groupPosts: this.state.groupPosts});
      }
    } else if (index === 4) {
      this.setState({postDeleteModel: true});
    } else if (index === -2) {
      this.props.navigation.push('Statistics', {data: data});
    }
  };
  handleEmojiKeboard = () => {
    Keyboard.dismiss();
    this.setState({isEmojiKeyboard: !this.state.isEmojiKeyboard});
  };
  postOptionClose = () => {
    this.setState({postOption: ''});
  };
  handleCategory = data => {
    this.setState({category: data});
    this.scrollUp();
  };
  closeReport = item => {
    if (item === null) {
      this.setState({
        reportModel: !this.state.reportModel,
      });
    } else {
      this.setState({
        reportModel: !this.state.reportModel,
      });
      setTimeout(() => {
        this.setState({
          reportDetails: !this.state.reportDetails,
        });
      }, 500);
    }
  };
  closeReportDetails = async (details, reason) => {
    const {groupDetailsData} = this.state;
    if (details === undefined || reason === undefined) {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
    } else {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
      let reportGroupForm = new FormData();
      reportGroupForm.append('group_id', groupDetailsData?.id);
      reportGroupForm.append('type', BLOCKTYPES.REPORT_GROUP);
      reportGroupForm.append('details', details);
      reportGroupForm.append('reason', reason);
      await this.props.reportGroup(reportGroupForm);
      if (this.props.reportGroupPayload?.success) {
        setTimeout(() => {
          this.setState({
            postPone: !this.state.postPone,
          });
        }, 700);
      }
    }
  };

  closePostpone = () => {
    this.setState({postPone: false});
  };

  handleMediaOptions = () => {
    this.setState({mediaOption: !this.state.mediaOption});
  };

  //join group
  handleGroupJoin = async () => {
    const {groupDetailsData} = this.state;
    this.setState({joinBtnPress: true, disabledButton: true});
    if (!this.state.joinBtnPress) {
      let groupId = groupDetailsData?.id;
      try {
        let groupJoinData = new FormData();
        groupJoinData.append('group_id', groupId);
        let joinGroup = await postAPICall(API.groupJoin, groupJoinData);
        if (joinGroup.error) {
          Alert.alert(joinGroup.errorMsg);
        } else {
          Alert.alert(getLocalText('Groups.joingroupMsg'));
          this.setState({disabledButton: false});
        }
      } catch (error) {
        this.setState({loadding: false, disabledButton: false});
        this.props.isPostLoading(0);
      }
    }
  };
  handlePostModal = (item, index, evt) => {
    this.setState({
      postOption: item?.id,
      postOptionIndex: this.state.postOptionIndex === index ? '' : index,
      indicatorOffset: evt.nativeEvent.pageY,
      handleOption: !this.state.handleOption,
    });
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

  //handle add member model
  handleAddMember = () => {
    this.setState({hadleAddMember: !this.state.hadleAddMember});
  };

  //close search model
  searchClose = item => {
    if (item) {
      this.setState({searchModel: false});
      this.props.navigation.navigate('UserDataSpecific', {
        data: item?.id,
        id: item?.id,
        screenName: SCREEN_TYPE.NEW_USER,
        // userSpefific: true,
      });
    } else {
      this.setState({searchModel: !this.state.searchModel});
    }
  };

  //handle close model
  handleCloseAddMember = async (data, type, roomName) => {
    const {groupDetailsData} = this.state;
    let membersIds = [];
    let navigate = type === 1 ? 'Chat' : 'AudioCall';
    data.map((item, i) => {
      membersIds.push(item?.member_id);
    });
    membersIds.push(this.props.userData.id);
    this.setState({hadleAddMember: false});
    let groupId = groupDetailsData?.id;
    try {
      let createRoomform = new FormData();
      createRoomform.append('group_id', groupId);
      createRoomform.append('users', JSON.stringify(membersIds));
      createRoomform.append('room_type', type === 1 ? 'Chat' : 'Audio');
      createRoomform.append('title', roomName);
      let response = await postAPICall(API.createRoom, createRoomform);
      if (response.success) {
        if (type === 1) {
          this.setState({roomList: [response.data, ...this.state.roomList]});
        } else {
          this.setState({
            audioDiscussionList: [
              response.data,
              ...this.state.audioDiscussionList,
            ],
          });
        }

        this.props.navigation.navigate(navigate, {
          groupData: groupDetailsData,
          members: response?.data,
          roomData: response?.data,
          roomId: response?.data?.room_id,
        });
      } else {
        this.setState({hadleAddMember: false});
        if (response.error) {
          Alert.alert(response.errorMsg);
        } else {
          Alert.alert(response.message);
        }
      }
    } catch (error) {}
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
        } else {
        }
      } catch (error) {}
    }
  };
  handleShare = async item => {
    const link = DeepLink + `?type=timeline&id=` + item?.item?.id;
    Share.open({url: link});
    try {
      await this.props.postLikeShareSave(item?.item?.id, 'share');
    } catch (error) {
      this.setState({loadding: false});
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

  handleGroupShare = ids => {
    this.setState({shareGroupsModel: false}, () => {
      if (ids != null) {
        this.handleShareMultiple(ids);
      }
    });
  };

  handleShareMultiple = async ids => {
    let pid = this.state.shareData?.item?.id;
    let response = await getAPICall(API.reshared + pid + `/[${ids}]`);
    if (response.success) {
      this.handleRefresh(); //valid
    }
  };

  handleMsgPopUp = async item => {
    const userID = item?.user_id;

    if (userID !== this.props.userData?.id) {
      let chatResponse = await getAPICall(API.chat + userID);
      this.props.navigation.navigate('Chat', {
        data: chatResponse.data,
        singleChat: '1',
      });
    }
  };

  // post reaction modal
  handlePressLike = async (item, index, evt) => {
    this.setState({
      postLikeOption: item?.id,
      postLikeOptionIndex:
        this.state.postLikeOptionIndex === index ? '' : index,
      indicatorOffsetForLike: evt.nativeEvent.pageY,
    });
  };

  onPressLikeEmoji = async value => {
    this.closeEmojiModal();
    const {postLikeOption} = this.state;
    var id = '';
    if (value === 0) {
      id = 1;
    } else if (value === 1) {
      id = 2;
    } else if (value === 2) {
      id = 3;
    } else if (value === 3) {
      id = 4;
    } else if (value === 4) {
      id = 5;
    }
    await this.props.postLikeShareSave(postLikeOption, 'like', id);
    if (this.props.isPostLike) {
      this.handleRefresh();
    }
  };

  closeEmojiModal = () => {
    this.setState({
      postLikeOptionIndex: '',
      postLikeOption: '',
      indicatorOffsetForLike: '',
    });
  };

  deletepostAction = async action => {
    this.setState({postDeleteModel: false});
    if (action === 1) {
      try {
        let postIndex = this.state.postOptionIndex;
        let posttId = this.state.selectedPost.id;

        let DeletePost = await getAPICall(API.deletePost + posttId);
        if (DeletePost) {
          this.state.groupPosts.splice(postIndex, 1);
          this.setState({groupPosts: this.state.groupPosts});
        }
      } catch (error) {
        this.setState({loadding: false});
      }
    }
  };

  postCommentViewHandle = () => {
    this.setState({postCommentView: true});
  };

  handlePostCommentClose = () => {
    this.setState({postCommentView: false});
  };

  exitGroupAction = async action => {
    const {groupDetailsData} = this.state;
    this.setState({exitGroupModel: false});
    if (action === 1) {
      let groupId = groupDetailsData?.id;
      this.props.exitGroup(groupId);
      this.props.navigation.goBack();
    }
  };

  renderFooter = item => {
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

  renderFooterRoom = () => {
    if (this.state.loadRoom) {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.blue}
          style={{marginTop: scale(-20)}}
        />
      );
    }
    return null;
  };

  renderFooterAudio = () => {
    if (this.state.loadAudio) {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.blue}
          style={{marginTop: scale(-20)}}
        />
      );
    }
    return null;
  };

  // -- Share button crash fixed -----
  postShareHandle = () => {
    this.setState({shareOptionsModel: true, shareData: this.state.viewPost});
  };
  //display users
  renderList = (item, index, type) => {
    const navigateScreen = type === 'message' ? 'Chat' : 'AudioCall';
    return (
      <MessageCard
        groupImages={this.props.route.params.item?.groupData}
        item={item}
        index={index}
        chat={type === 'message' ? true : false}
        onPress={async () => {
          var lastGroupChatId;
          if (type === 'message') {
            lastGroupChatId = await getAPICall(
              API.lastGroupChatId + item?.room_id,
            );
          }

          this.props.navigation.navigate(navigateScreen, {
            // groupData: this.props.route.params.item?.groupData,
            groupData: item,
            members: this.state.roomList,
            newJoin: false,
            // userData: item,
            roomData: item,
            roomId: item?.room_id,
            lastGroupChatId: lastGroupChatId?.data?.last_message_id,
          });
        }}
      />
    );
  };

  renderPost = ({item, index}) => {
    return (
      <PostCard
        item={item}
        index={index}
        {...this.state}
        handlePostModal={this.handlePostModal}
        toggleVideoButton={this.toggleVideoButton}
        onLikePress={this.onLikePress}
        onCommentPress={this.onCommentPress}
        onPressSend={() => {}} // In this screen post comment is not handle from footer
        onChangeText={text => {
          this.handleCommentTxt(text, item);
        }}
        value={this.state.commenttxt}
        onPressEmoji={this.handleEmojiKeboardC}
        onPressKeyboard={() => this.setState({isEmojiKeyboardC: false})}
        emojiKeyboard={this.state.isEmojiKeyboardC}
        color={this.state.commenttxt.trim().length > 0 ? false : true}
        openImageView={this.handleImagesView}
        onSharePress={this.onShare}
        userImg={
          !this.props.userData ||
          this.props?.userData?.user_pic?.original === undefined
            ? ''
            : this.props?.userData?.user_pic?.original
        }
        flatListScroll={this.state.scrollFlat}
        onPressCommentLike={this.onPressCommentLike}
        onPressGroup={this.onPressGroup}
        onPressImage={this.onPressImage}
        onPressProfile={() => this.onPressProfile(item)}
        updateCommentCount={this.updateCommentCount}
        userData={this.props.userData}
        adminShow={true}
        onPressSharePost={() => this.onPressProfile(item)}
        hashTag
        showOption={this.state.joined ? true : false}
        onPressHastag={this.onPressHastag}
        joinGroup={this.state.joined}
        handleMsgPopUp={this.handleMsgPopUp}
        handlePostLike={this.handlePressLike}
      />
    );
  };

  render() {
    const {
      joined,
      isEmojiKeyboard,
      isEmojiKeyboardC,
      commenttxt,
      groupName,
      groupPosts,
      postLikeOptionIndex,
      postLikeOption,
      category,
      roomList,
      audioRefreshing,
      audioDiscussionList,
      loadding,
      searchModel,
      selectSearch,
      searchData,
      searchText,
      tabId,
      popUpModel,
      disabledButton,
      sponsorModel,
      paymentModel,
      perfectModel,
      postPone,
      cameraModel,
      shareOptionsModel,
      shareGroupsModel,
      postDeleteModel,
      exitGroupModel,
      paymentCardData,
      attachImages,
      postText,
      mediaOption,
      reportDetails,
      deleteModel,
      reportModel,
      options2,
      groupOptions,
      options1,
      fullScreenView,
      viewPost,
      userImagePost,
      viewPostIndex,
      postCommentView,
      groupDetailsData,
      refreshChatRoom,
    } = this.state;
    const {userData, navigation, route} = this.props;

    const {notificationBell, reportReasonList} = this.props;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        {joined && (
          <SearchBar
            isHelpIcon={userData.id === route.params.item?.groupData.created_by}
            image={route.params.item?.groupData?.image?.original}
            onNotificationPress={() => navigation.navigate('Notification')}
            bellColor={
              notificationBell ? theme.colors.blue : theme.colors.darkGrey
            }
            notificationBadge={notificationBell}
            searchText={searchText}
            {...this.props}
            options
            isTabshow
            onPressOptions={() => {
              this.setState({menu: !this.state.menu});
            }}
            onSearchPress={() => this.setState({searchText: ''})}
            customSearch
            category={d => {
              this.handleSearch(d);
            }}
            onSearchText={txt => {
              this.setState({searchText: txt});
              this.handleSearch(selectSearch);
            }}
            groupDetails
          />
        )}
        {mediaOption && category === 1 ? (
          <MediaOptions
            isVisible={mediaOption}
            close={() => this.handleMediaOptions()}
            onPressCamera={() => {
              this.setState({
                cameraModel: !this.state.cameraModel,
                mediaOption: false,
              });
            }}
            onPressGallery={() => {
              this.openImagePicker();
            }}
            onPressVideo={() => {
              this.handleMediaOptions();
              setTimeout(() => {
                this.openVideoPicker();
              }, 500);
            }}
            onPressVideoCamera={() => {
              this.openVideoCamera();
            }}
            onPressFile={() => {
              this.openFile();
            }}
          />
        ) : null}
        {!joined && (
          <HeaderView
            optionHandler={() => this.setState({menu: !this.state.menu})}
            {...this.props}
            title={groupName}
            option={true}
            color={this.state.menu ? theme.colors.blue : theme.colors.darkGrey}
          />
        )}
        {searchText.length === 0 ? (
          <>
            {joined && category === 1 ? (
              <PostBar
                profilePic={
                  userData?.user_pic ? userData?.user_pic?.optimize : ''
                }
                onPressEmoji={this.handleEmojiKeboard}
                onPressKeyboard={() => {
                  this.setState({isEmojiKeyboard: false});
                }}
                style={{marginTop: scale(22)}}
                onPressAttachment={this.handleMediaOptions}
                onPressSend={() => {
                  if (postText.trim().length > 0 || attachImages.length > 0) {
                    this.handleSendPost();
                  }
                }}
                sendColor={
                  postText.trim().length > 0 || attachImages.length > 0
                    ? true
                    : false
                }
                removeImage={this.removeImage}
                {...this.state}
                onChangeText={text => {
                  this.handlePostTxt(text);
                }}
                value={postText}
                emojiKeyboard={this.state.isEmojiKeyboard}
                hideGroup={true}
              />
            ) : null}
            {joined && route.params.item?.groupData?.description && (
              <View style={[styles.row, styles.descContainer]}>
                <View style={styles.row}>
                  <Icon
                    name="disc"
                    size={scale(14)}
                    color={theme.colors.blue}
                  />
                  <Label
                    title={route.params.item?.groupData?.description}
                    style={{left: scale(5)}}
                    numberOfLines={2}
                  />
                </View>
              </View>
            )}
          </>
        ) : null}
        {/* <View style={styles.container}>
          <Icon
            name="more-vertical"
            color={this.state.menu ? theme.colors.blue : theme.colors.grey16}
            size={scale(19)}
            onPress={() => this.setState({menu: !this.state.menu})}
          />
        </View> */}
        {searchText ? (
          <View>
            <View style={[styles.row, {paddingHorizontal: scale(15)}]}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({searchText: ''});
                }}
                style={{paddingLeft: scale(15)}}>
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
            {selectSearch === 1 ? (
              <ScrollView
                style={{marginTop: scale(10), paddingHorizontal: scale(10)}}>
                {searchData !== '' &&
                  searchData?.users?.map((item, index) => {
                    return (
                      <TouchableOpacity
                        style={styles.userView}
                        key={index}
                        onPress={() => {
                          this.props.navigation.navigate('UserDataSpecific', {
                            data: item?.id,
                            id: item?.id,
                            screenName: SCREEN_TYPE.NEW_USER,
                          });
                        }}>
                        <FastImage
                          source={{uri: item?.user_pic?.optimize}}
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
                              this.props.navigation.navigate(
                                'UserDataSpecific',
                                {
                                  data: item?.id,
                                  id: item?.id,
                                  screenName: SCREEN_TYPE.NEW_USER,
                                },
                              );
                            }}
                            style={{paddingLeft: scale(15)}}>
                            <Icon
                              name={'arrow-right'}
                              color={theme.colors.blue}
                              size={scale(20)}
                            />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            ) : selectSearch === 2 ? (
              <>
                <View style={styles.searchPost}>
                  <FlatList
                    ref={ref => (this.FlatListRef = ref)}
                    contentContainerStyle={{
                      paddingBottom: theme.SCREENHEIGHT * 0.1,
                      backgroundColor: theme.colors.transparent,
                    }}
                    keyExtractor={(_, index) => index.toString()}
                    data={this.state.searchData.posts}
                    extraData={[this.state, this.props]}
                    renderItem={this.renderPost}
                  />
                </View>
              </>
            ) : selectSearch === 3 ? (
              <ScrollView
                style={{marginTop: scale(10), paddingHorizontal: scale(10)}}>
                {searchData &&
                  searchData?.groups?.map((item, index) => {
                    return (
                      <GroupCard
                        item={item}
                        index={index}
                        onPress={this.onPressGroupSearch}
                        onPressNotification={() => {}}
                        onPressGroup={this.onPressGroupSearch}
                        onPressImage={this.onPressMemberSearch}
                        handleMsgPopUp={this.handleMsgPopUp}
                      />
                    );
                  })}
              </ScrollView>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.fillterCon}>
              {joined ? (
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{paddingHorizontal: scale(18)}}>
                  {this.state.fillterItems.map((data, index) => {
                    return (
                      <TouchableOpacity
                        key={index.toString()}
                        onPress={() =>
                          joined ? this.handleCategory(data.id) : null
                        }
                        style={[
                          styles.fillterbtn,
                          externalStyle.shadow,
                          {
                            backgroundColor:
                              data.id === this.state.category
                                ? theme.colors.white
                                : theme.colors.grey14,
                          },
                        ]}>
                        <Label title={data.title} style={styles.titletxt} />
                        <TouchableOpacity
                          onPress={() => {
                            this.handlePopUpModel(data.id);
                          }}>
                          {data.id !== 1 ? (
                            <Icon
                              name={'help-circle'}
                              color={theme.colors.blue}
                              size={scale(16)}
                              style={styles.helpIcon1}
                            />
                          ) : null}
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <View style={styles.gd}>
                  <>
                    <Label title={'Group Description'} style={styles.gdtxt} />
                    <Label
                      title={route.params.item?.groupData?.description}
                      style={styles.descrptiontxt}
                    />
                  </>
                </View>
              )}
            </View>
            {category === 1 ? (
              <>
                <FlatList
                  ref={ref => (this.FlatListRef = ref)}
                  contentContainerStyle={{
                    paddingBottom: joined ? scale(10) : scale(75),
                  }}
                  keyExtractor={(_, index) => index.toString()}
                  data={groupPosts}
                  extraData={[this.state, this.props]}
                  renderItem={this.renderPost}
                  onScroll={e => {
                    this.setState({
                      scrollFlat: e.nativeEvent.contentOffset.y,
                      postLikeOptionIndex: '',
                    });
                    this.postOptionClose();
                    this.setState({
                      isEmojiKeyboard: false,
                      isEmojiKeyboardC: false,
                      mediaOption: false,
                    });
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={this.state.refreshing}
                      onRefresh={this.handleRefresh}
                    />
                  }
                  ListFooterComponent={this.renderFooter.bind(this)}
                  onEndReachedThreshold={0.5}
                  onEndReached={this.loadMoreGroup}
                  ListEmptyComponent={() => (
                    <View style={styles.nodata}>
                      {!loadding ? Config.NO_DATA_COMPO(loadding) : null}
                    </View>
                  )}
                />
                {this.state.postOptionIndex !== '' &&
                this.state.postOption ===
                  groupPosts[this.state.postOptionIndex].id ? (
                  <PostOptions
                    {...this.props}
                    {...this.state}
                    item={groupPosts[this.state.postOptionIndex].id}
                    data={groupPosts[this.state.postOptionIndex]}
                    isSponsored={
                      groupPosts[this.state.postOptionIndex].is_sponsored
                    }
                    handleOptions={this.handleOptions}
                    singleOption={false}
                    userData={userData}
                  />
                ) : null}
                {postLikeOptionIndex !== '' &&
                postLikeOption === groupPosts[postLikeOptionIndex].id ? (
                  <ReactionModel
                    {...this.props}
                    {...this.state}
                    onPressLikeEmoji={this.onPressLikeEmoji}
                  />
                ) : null}
              </>
            ) : category === 2 ? (
              <FlatList
                ref={ref => (this.FlatListRef = ref)}
                contentContainerStyle={{paddingBottom: scale(75)}}
                keyExtractor={(_, index) => index.toString()}
                data={roomList}
                extraData={[this.state, this.props]}
                renderItem={({item, index}) =>
                  this.renderList(item, index, 'message')
                }
                refreshControl={
                  <RefreshControl
                    refreshing={refreshChatRoom}
                    onRefresh={this.handleRefreshChatRoom}
                  />
                }
                ListEmptyComponent={() => (
                  <View style={styles.nodata}>
                    {!loadding ? Config.NO_DATA_COMPO(loadding) : null}
                  </View>
                )}
                ListFooterComponent={this.renderFooterRoom.bind(this)}
                onEndReachedThreshold={0.2}
                onEndReached={this.loadMoreRoom}
              />
            ) : (
              <FlatList
                ref={ref => (this.FlatListRef = ref)}
                contentContainerStyle={{paddingBottom: scale(75)}}
                keyExtractor={(_, index) => index.toString()}
                data={audioDiscussionList}
                extraData={[this.state, this.props]}
                renderItem={({item, index}) =>
                  this.renderList(item, index, 'audio')
                }
                refreshControl={
                  <RefreshControl
                    refreshing={audioRefreshing}
                    onRefresh={this.handleRefreshAudioRoom}
                  />
                }
                ListEmptyComponent={() => (
                  <View style={styles.nodata}>
                    {!loadding ? Config.NO_DATA_COMPO(loadding) : null}
                  </View>
                )}
                ListFooterComponent={this.renderFooterAudio.bind(this)}
                onEndReachedThreshold={0.2}
                onEndReached={this.LoadMoreAudioRooms}
              />
            )}
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
              onRemove={() => {
                var str;
                if (isEmojiKeyboardC) {
                  str = this.safeEmojiBackspace(commenttxt);
                  this.setState({commenttxt: str});
                }
                if (isEmojiKeyboard) {
                  str = this.safeEmojiBackspace(postText);
                  this.setState({postText: str});
                }
              }}
              hideBackSpace={false}
              onClose={() => this.setState({isEmojiKeyboard: false})}
            /> */}
            <View>
              {category === 1 ? (
                !joined ? (
                  <Button
                    helpIcon={'help-circle'}
                    joinGrouptxt
                    helpColor={theme.colors.blue}
                    onPress={() => this.handleGroupJoin()}
                    title={getLocalText('Group.joingroup')}
                    style={[
                      styles.btn1,
                      styles.helpIcon,
                      {
                        borderColor: theme.colors.blue,
                      },
                    ]}
                    titleStyle={{color: theme.colors.blue}}
                    isHelpIcon
                    disabled={disabledButton}
                  />
                ) : null
              ) : (
                //only admin can create new private chat grp condition code is commented and put that code at line 1931
                <Button
                  joinGrouptxt
                  helpColor={theme.colors.blue}
                  onPress={() => {
                    this.handleAddMember(category);
                    if (category === 2) {
                      this.setState({openAddMemberType: 1});
                    } else {
                      this.setState({openAddMemberType: 2});
                    }
                  }}
                  title={
                    category === 2
                      ? getLocalText('Group.newconversationbtn')
                      : getLocalText('Group.audiobtn')
                  }
                  style={[styles.btn, {backgroundColor: theme.colors.blue}]}
                />
              )}
            </View>
          </>
        )}
        <PopUpModel
          isVisible={popUpModel}
          title={
            tabId === 2
              ? getLocalText('Information.privateMessagestitle')
              : getLocalText('Information.audioConvertitle')
          }
          description={
            tabId === 2
              ? getLocalText('Information.privateMessagesdisc')
              : getLocalText('Information.audioConverdisc')
          }
          close={() => {
            this.handlePopUpModel(this.state.tabId);
          }}
        />

        <Menus
          isMenu={this.state.menu}
          isHelpIcon={true}
          isGroupDetails={true}
          menuData={
            joined
              ? route.params.item?.groupData.group_admin_id === userData.id
                ? options2
                : groupOptions
              : options1
          }
          handleMenu={this.handleMenus}
        />
        <ReportModel
          isVisible={reportModel}
          toggleReportmodel={this.closeReport}
          data={route.params.item?.groupData}
          reportGroup={true}
        />
        <ConfirmationModel isVisible={deleteModel} close={this.deleteGroup} />
        <SearchModel isVisible={searchModel} closeSearch={this.searchClose} />
        <ReportDetailsModel
          show={reportDetails}
          closeModal={this.closeReportDetails}
          reasonList={reportReasonList}
          reportType={BLOCKTYPES.REPORT_GROUP}
          postData={true}
        />
        <Sponsor
          isVisible={sponsorModel}
          togglePaymentModal={this.closeSponsorModel}
        />
        <PaymentModel
          {...this.props}
          isVisible={paymentModel}
          closeModal={this.closePaymentModal}
          cardData={paymentCardData}
        />
        <PerfectModel
          isVisible={perfectModel}
          close={this.closePerfectModel}
          onRedirect={() => {
            this.handlePerfectModal();
          }}
        />
        <PostponedModel isVisible={postPone} close={this.closePostpone} />
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
        <ShareOptions
          showModel={shareOptionsModel}
          handleClose={this.handleShareOption}
        />
        <SharePostGroupModel
          show={shareGroupsModel}
          closeModal={this.handleGroupShare}
        />
        <ConfirmationModel
          isVisible={exitGroupModel || postDeleteModel}
          type={exitGroupModel ? 'groupexit' : 'post'}
          close={action =>
            exitGroupModel
              ? this.exitGroupAction(action)
              : this.deletepostAction(action)
          }
        />

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
        <AddConversionsMembersModel
          show={this.state.hadleAddMember}
          closeModal={this.handleAddMember}
          groupMembers={groupDetailsData}
          type={this.state.openAddMemberType}
          userData={userData}
          selectedClose={this.handleCloseAddMember}
        />
        {this.props.load || this.state.loadding ? (
          <Loader loading={this.props.load || this.state.loadding} />
        ) : null}
        <OfflineModel />
        <PostsCommentModel
          isVisible={postCommentView}
          close={this.handlePostCommentClose}
          data={viewPost}
          index={viewPostIndex}
          userImg={userData.user_pic?.optimize}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.32),
    right: -(theme.SCREENHEIGHT * 0.38),
    transform: [{rotate: '75deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.38),
    left: -(theme.SCREENHEIGHT * 0.39),
    transform: [{rotate: '75deg'}],
  },
  container: {
    flexDirection: 'row',
    marginTop: scale(20),
    marginHorizontal: scale(18),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fillterCon: {
    marginVertical: scale(15),
    justifyContent: 'space-around',
  },
  titletxt: {
    color: theme.colors.blue,
  },
  fillterbtn: {
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(11),
    borderRadius: scale(20),
    flexDirection: 'row',
  },
  helpIcon: {
    paddingHorizontal: scale(10),
    marginTop: scale(-10),
    marginBottom: scale(5),
    marginLeft: scale(200),
  },
  helpIcon1: {
    paddingHorizontal: scale(10),
  },
  btn: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: 1,
    width: theme.SCREENWIDTH * 0.9,
    borderRadius: scale(40),
  },
  btn1: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.blue,
    borderWidth: 1,
    marginHorizontal: scale(10),
    paddingVertical: scale(5),
    width: theme.SCREENWIDTH * 0.9,
    borderRadius: scale(40),
  },
  nodata: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.SCREENHEIGHT * 0.56,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  gd: {
    backgroundColor: theme.colors.blue,
    margin: scale(10),
    padding: scale(8),
    borderRadius: scale(10),
    marginHorizontal: scale(15),
  },
  gdtxt: {
    left: scale(5),
    color: theme.colors.white,
    fontFamily: theme.fonts.muktaBold,
  },
  descrptiontxt: {
    left: scale(5),
    marginTop: scale(5),
    color: theme.colors.white,
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
  searchPost: {
    height: theme.SCREENHEIGHT * 0.65,
    width: '100%',
    marginTop: scale(10),
  },
  descContainer: {
    paddingHorizontal: scale(20),
    top: scale(10),
    justifyContent: 'space-between',
  },
});

const mapStateToProps = state => {
  const userData = state.UserInfo.data;
  const allPost = state.PostReducer.getData;
  const load = state.PostReducer.load;
  const isPostLike = state.PostReducer.postLike;
  const isCommentLike = state.PostReducer.commentLike;
  const created_g_count = state.UserInfo.creaetedGroupCount;
  const notificationBell = state.UserInfo.notificationBellIcon;
  const reportReasonList = state.PostReducer.reportReasonList;
  const getGroupDataList = state.PostReducer.getGroupData;
  const getGroupChatRoomData = state.PostReducer.getGroupChatRoomData;
  const reportGroupPayload = state.groupsReducer.reportGroupPayload;

  return {
    userData,
    allPost,
    load,
    isPostLike,
    isCommentLike,
    created_g_count,
    notificationBell,
    reportReasonList,
    getGroupDataList,
    getGroupChatRoomData,
    reportGroupPayload,
  };
};
export default connect(mapStateToProps, {
  addPost,
  isPostLoading,
  postCommentSend,
  postLikeShareSave,
  commentLike,
  exitGroup,
  reportGroup,
  getJoinGroupCount,
  manageNotification,
  CreatedGroupCount,
  getGroupPost,
  getGroupRoom,
  getGroupRoomAudio,
  getJoinedGroups,
})(GroupDetails);
