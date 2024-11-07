/* eslint-disable no-unused-vars */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  PermissionsAndroid,
  Keyboard,
  KeyboardAvoidingView,
  ToastAndroid,
  Dimensions,
  Alert,
  Animated,
  AppState,
  ActivityIndicator,
} from 'react-native';
import EmojiPicker from 'rn-emoji-keyboard';
import io from 'socket.io-client';
import RNFS from 'react-native-fs';
import SocketIOFileClient from 'socket.io-file-client';
import Peer from 'react-native-peerjs';
import Icon from 'react-native-vector-icons/Feather';
import Icon2 from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import Icon1 from 'react-native-vector-icons/Entypo';
import ImagePicker from 'react-native-image-crop-picker';
import ChunkUpload from 'react-native-chunk-upload';
import {connect} from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Clipboard from '@react-native-clipboard/clipboard';
import SimpleToast from 'react-native-simple-toast';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
} from 'react-native-audio-recorder-player';
import {stat} from 'react-native-fs';
import Slider from '@react-native-community/slider';
import Image from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Bar';
import TrackPlayer from 'react-native-track-player';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';
// import EmojiBoard from 'react-native-emoji-board';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  HeaderView,
  ReportModel,
  Menus,
  ReportDetailsModel,
  PostponedModel,
  GroupImages,
  AudioMsg,
  FullMediaModel,
  Loader,
  ChatMediaOption,
} from '../Components';
import {images, scale, theme, imageData} from '../Utils';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {BLOCKTYPES, SCREEN_TYPE} from '../Utils/StaticData';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import {
  reportGroup,
  suspendRoomNotication,
  reportChat,
  getChatReoomsLocally,
} from '../Redux/Actions';
let loadMoreData = false;
let openAttachment = false;
class Chat extends Component {
  constructor(props) {
    super(props);
    this.appState = React.createRef(AppState.currentState);
    this.state = {
      Kheight: Dimensions.get('window').height,
      menu: false,
      groupDetails: this.props.route?.params.roomData
        ? this.props.route?.params.roomData
        : this.props.route.params?.groupData,
      newjoin: this.props.route.params.newJoin,
      options: [
        {icon: 'info', name: getLocalText('Chat.groupinfo')},
        {icon: 'bell', name: getLocalText('Chat.notification')},
        {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        {icon: 'log-out', name: getLocalText('GroupInfo.leaveRoom')},
      ],
      chatOption: [
        {
          icon: 'user',
          name: `${
            this?.props?.route?.params?.data?.receiver?.first_name
          } ${getLocalText('UserData.profile')}`,
        },
        {
          icon: this?.props?.route?.params?.data?.is_suspend
            ? 'bell-off'
            : 'bell',
          name: this?.props?.route?.params?.data?.is_suspend
            ? getLocalText('Chat.notificationoff')
            : getLocalText('Chat.notification'),
        },
        {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        {icon: 'image', name: `${getLocalText('GroupInfo.media')}`},
      ],
      msg: '',
      roomData: this.props.route.params?.roomData?.data,
      messages: [],
      attachImages: '',
      currentTime: 0.0,
      recording: false,
      stopRecording: false,
      time: '',
      previousIndex: null,
      paused: false,
      stoppedRecording: false,
      finished: false,
      hasPermission: undefined,
      isStartRecord: false,
      reportModel: false,
      reportDetails: false,
      postPone: false,
      isEmojiKeyboard: false,
      keybordStatus: false,
      fullScreenMedia: false,
      loading: false,
      loadmore: false,
      page: 1,
      totalPage: 1,
      refreshing: false,
      perPageData: 0,
      modelData: [],
      userDetails:
        this.props.route.params.userData !== undefined
          ? this.props.route.params.userData
          : undefined,
      newFilePath: '',
      isPressed: false,
      animated: new Animated.Value(0.8),
      userReciverData: this?.props?.route?.params?.data?.receiver, //userReciverData?.first_name
      loginUserData: this.props.userData,
      singleChatId: this?.props?.route?.params?.singleChat,
      optionModal: false,
      isLoggingIn: false,
      msgshow: false,
      recordSecs: 0,
      recordTime: '00:00:00',
      currentPositionSec: 0,
      currentDurationSec: 0,
      playTime: '00:00:00',
      duration: '00:00:00',
      optins: [
        {
          id: 1,
          title: getLocalText('Timeline.Copy'),
          icon: 'copy',
        },
      ],
      indexValue: -1,
      selectedComment: '',
      cameraModel: false,
      isMediaOption: false,
      audioId: '',
      audioPlayButton: true,
      audioPlayDisableButton: true,
      isShowRecordLbl: false,
      position: TrackPlayer.getPosition(),
      mediaIconShown: false,
      viewYposition: null,
      isAudioResume: false,
      imageChatPath: '',
      documentPath: '',
      lastessageId: this.props.route?.params?.data?.last_message_id,
      lastGroupChatId: this.props.route?.params?.lastGroupChatId,
    };
    this.onPressAnimation = this.onPressAnimation.bind(this);
    this.send = this.send.bind(this);
    this.FlatListRef = null;
    this.socketRef = null;
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );

    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.audioRecorderPlayer.setSubscriptionDuration(0.09); // optional. Default is 0.1
  }

  componentDidMount() {
    this.callInitialize();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  callInitialize = () => {
    this.createDirectory();
    // this.permission();
    this.initSoket();
  };

  _handleAppStateChange = nextAppState => {
    // We need to fix when app in background
    if (!this.state.isMediaOption && nextAppState !== this.appState.current) {
      if (nextAppState === 'active') {
        this.appState.current = AppState.currentState;
        this.callInitialize();
      } else if (nextAppState === 'active' && !this.peer) {
        this.initSoket();
      } else if (nextAppState === 'background') {
        this.appState.current = AppState.currentState;
        this.clearData();
        this.setState({lastessageId: 0});
      }
    }
  };

  clearData = () => {
    this.socketConnect.disconnect('disconnect', () => {});
    this.socketConnect.close();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    clearInterval(this.Clock);
  };

  componentWillUnmount() {
    this.clearData();
  }

  //handle notification
  notificationHandle = () => {
    Platform.OS === 'android'
      ? ToastAndroid.showWithGravity(
          getLocalText('Chat.notification'),
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        )
      : Alert.alert(getLocalText('Chat.notification'));
  };

  createDirectory = async () => {
    const folderPath = RNFS.DocumentDirectoryPath + '/assets';
    let roomId =
      this.state.singleChatId === '1'
        ? this?.props?.route?.params?.data?.id
        : this.props.route.params.roomId;
    var filePath = folderPath + '/media/' + roomId + '/';
    await RNFS.mkdir(folderPath);
    await RNFS.mkdir(folderPath + '/media');
    await RNFS.mkdir(filePath);

    this.setState({documentPath: filePath}, () => {
      if (this.state.singleChatId === '1') {
        this.readPrivateChatMessage();
      } else {
        this.chatHistory();
      }
    });

    // RNFS.readDir(RNFS.DocumentDirectoryPath + `/assets/media/${roomId}`) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
    //   .then(async (result) => {
    //     let appFolder = 'frate/frate.txt';
    //     let path = RNFS.ExternalStorageDirectoryPath + '/';
    //     // await RNFS.mkdir(path);
    //   })
    //   .catch((err) => {});
  };

  //get chat history
  chatHistory = async (screenLoaderDisable = false) => {
    this.setState({loading: !screenLoaderDisable, page: 1});
    let getChatHistorys = await this.callGroupChatApi(1);
    if (getChatHistorys.success) {
      const {total_page, per_page_data, data} = getChatHistorys;

      const groupMessages = data;
      for (let index = 0; index < groupMessages.length; index++) {
        const element = groupMessages[index];
        if (
          element.video_thumb &&
          (element.message_type === 'Image' || element.message_type === 'Video')
        ) {
          let imagePath = await this.fileDownload({
            url: element.video_thumb,
            fileName: element.message,
            type: element.message_type,
          });
          groupMessages[index].localFilePath = imagePath;
        }
      }

      this.setState({
        messages: groupMessages,
        loading: false,
        refreshing: false,
        totalPage: total_page,
        perPageData: per_page_data,
        lastGroupChatId: screenLoaderDisable
          ? groupMessages[0].id
          : this.state.lastGroupChatId,
      });
    } else {
      this.setState({loading: false});
    }
  };

  callGroupChatApi = async (page = 1) => {
    const {lastGroupChatId} = this.state;
    let getChatHistorys = await getAPICall(
      API.chathistory +
        this.props?.route?.params?.roomId +
        '?page=' +
        page +
        '&last_id=' +
        (page === 1 ? 0 : lastGroupChatId),
    );
    return getChatHistorys;
  };

  //call api for unreadmessage one to one chat- pass last message api
  readPrivateChatMessage = async (screenLoaderDisable = false) => {
    // screenLoaderDisable = true means pull to refresh
    this.setState({loading: !screenLoaderDisable, page: 1});
    try {
      let getSingleChatHistory = await this.callPersonalChatApi(
        1,
        screenLoaderDisable,
      );
      this.setState({loading: false, refreshing: false});
      if (getSingleChatHistory.success) {
        const {data, total_page, per_page_data} = getSingleChatHistory;
        let messagesData = data;
        for (let index = 0; index < messagesData.length; index++) {
          const element = messagesData[index];
          if (
            element.video_thumb &&
            (element.message_type === 'Image' ||
              element.message_type === 'Video')
          ) {
            let imagePath = await this.fileDownload({
              url: element.video_thumb,
              fileName: element.message,
              type: element.message_type,
            });
            messagesData[index].localFilePath = imagePath;
          }
        }
        this.setState(
          {
            messages: messagesData,
            totalPage: total_page,
            perPageData: per_page_data,
            lastessageId: screenLoaderDisable
              ? getSingleChatHistory.data[0].id
              : this.state.lastessageId,
          },
          async () => {
            let lastId =
              this.state.messages?.length > 0 ? this.state.messages[0].id : '';
            if (lastId) {
              let groupData = new FormData();
              groupData.append('chat_message_id', lastId);
              await postAPICall(API.updateChatStatusOnetoOne, groupData);
            }
          },
        );
      }
    } catch (e) {
      this.setState({loading: false});
    }
    // for (let index = 0; index < this.state.messages.length; index++) {
    //   const element = this.state.messages[index];
    //   if (element.video_thumb) {
    //     let imagePath = await this.fileDownload({
    //       url: element.video_thumb,
    //       fileName: element.message,
    //     });
    //     this.state.messages[index].localFilePath = imagePath;
    //   }
    // }
  };

  callPersonalChatApi = async (page = 1, isRefresh = false) => {
    const {lastessageId} = this.state;
    const {route} = this.props;
    let response = await getAPICall(
      API.getChatHistory +
        '/' +
        route?.params?.data?.id +
        '?page=' +
        page +
        '&last_id=' +
        (isRefresh ? 0 : lastessageId),
    );

    return response;
  };

  //soket setup
  initSoket = async () => {
    let soketUrl = 'https://frate.eugeniuses.com:3030';
    this.brokeringId = undefined;
    const {singleChatId} = this.state;

    var peer = new Peer(this.brokeringId, {
      path: '/peerjs',
      host: 'frate.eugeniuses.com',
      port: '3030',
      secure: true,
      debug: 3,
    });

    peer.on('error', _err => {});
    this.socketConnect = io.connect(soketUrl, {
      // transports: ['websocket'],
    });
    this.uploader = new SocketIOFileClient(this.socketConnect);

    this.socketConnect.on('connect_error', () => {});
    this.socketConnect.on('error', () => {});

    this.socketConnect.on('connect', () => {
      let roomId =
        singleChatId === '1'
          ? this?.props?.route?.params?.data?.id
          : this.props.route.params.roomId;
      if (roomId) {
        this.socketConnect.emit(
          singleChatId === '1' ? 'join-conversation' : 'join-room',
          singleChatId === '1'
            ? this?.props?.route?.params?.data?.id
            : this.props.route.params.roomId,
          this.brokeringId,
          this.state.loginUserData?.id,
          this.state.loginUserData?.first_name +
            this.state.loginUserData?.last_name,
          this.state.loginUserData?.user_pic?.optimize,
        );
      }
    });

    this.socketConnect.on(
      singleChatId === '1' ? 'conversation-user-connected' : 'user-connected',
      userBrokeringId => {
        this.setState({loading: false});
      },
    );
    //conversation-upload-file

    this.socketConnect.on(
      'newFileMessage',
      async (fileInfo, file_user_id, userName, profilePic) => {
        var imagePath = '';
        if (fileInfo.type === 'Image' || fileInfo.type === 'Video') {
          imagePath = await this.fileDownload({
            url: fileInfo.video_thumb,
            fileName: fileInfo.fileName,
            type: fileInfo.type,
          });
        }
        let new_msg = {
          message_type: fileInfo?.type,
          message: fileInfo.fileName,
          attachment: fileInfo.fileUrl, //this.state.imageChatPath,
          stream_start: fileInfo.createdAt,
          user_name: userName,
          user_id: Number(file_user_id),
          color: theme.colors.black,
          user_image: profilePic,
          audio_duration: fileInfo.audio_duration,
          video_thumb: fileInfo.video_thumb,
          localFilePath: imagePath,
        };

        let messagesData = [new_msg, ...this.state.messages];
        this.setState({
          messages: messagesData,
          totalPage: Math.ceil(messagesData.length / this.state.perPageData),
        });
      },
    );

    this.socketConnect.on(
      singleChatId === '1' ? 'conversationCreateMessage' : 'createMessage',
      (message, remoteUserId, remoteUserName, timeStamp, userProfilePic) => {
        let newmessage = {
          message: message,
          stream_start: timeStamp,
          user_name: remoteUserName,
          user_id: remoteUserId,
          color: theme.colors.black,
          media: '',
          user_image: userProfilePic,
        };

        this.setState(
          {messages: [newmessage, ...this.state.messages]},
          () => {},
        );
      },
    );
  };

  _keyboardDidShow = () => {
    this.setState({keybordStatus: true});
  };

  _keyboardDidHide = () => {
    this.setState({keybordStatus: false});
  };

  handleEmojiKeboard = () => {
    this.setState({
      isEmojiKeyboard: !this.state.isEmojiKeyboard,
    });
    Keyboard.dismiss();
  };

  handleClose = () => {
    this.setState({fullScreenMedia: false});
  };

  async permission() {
    if (Platform.OS === 'android') {
      try {
        // const requiredPermissions = [
        //   PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        //   PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        //   PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        // ];
        // const permissionStatuses = {};
        // for (const permission of requiredPermissions) {
        //   const isGranted = await PermissionsAndroid.check(permission);
        //   console.log('isGranted', isGranted);
        //   permissionStatuses[permission] = isGranted ? 'granted' : 'denied';
        // }

        // // Filter out permissions that are not granted
        // const permissionsToRequest = requiredPermissions.filter(
        //   permission => permissionStatuses[permission] !== 'granted',
        // );
        // console.log('requiredPermissions', permissionsToRequest);
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
        } else {
          return;
        }
      } catch (err) {
        console.log('Permission Message ::', err);
        return;
      }
    }
  }

  handleOptions = async index => {
    const {singleChatId} = this.state;
    this.setState({menu: !this.state.menu});
    setTimeout(async () => {
      if (index === 0) {
        if (singleChatId === '1') {
          this.props.navigation.navigate('UserDataSpecific', {
            data: this.state?.userReciverData?.id,
            id: this.state?.userReciverData?.id,
            screenName: SCREEN_TYPE.NEW_USER,
            type: '1',
          });
        } else {
          this.props.navigation.navigate('GroupInformation', {
            groupData: this.state.groupDetails,
            userLists: this.props.route.params.members,
          });
        }
      }
      if (index === 1) {
        if (singleChatId !== '1') {
          this.props.suspendRoomNotication(this.props.route.params?.roomId);
        } else {
          let success = await getAPICall(
            API.suspendPrivateMsg + this.state?.userReciverData?.id,
          );

          this.state.chatOption[1].icon = success.data.data
            ? 'bell-off'
            : 'bell';
          this.state.chatOption[1].name = success.data.data
            ? getLocalText('Chat.notificationoff')
            : getLocalText('Chat.notification');
          this.setState({chatOption: this.state.chatOption});
          if (success.error) {
          }
        }
      } else if (index === 2) {
        this.setState({reportModel: !this.state.reportModel});
      } else if (index === 3) {
        if (singleChatId === '1') {
          this.props.navigation.navigate('GroupInformation', {
            singleChatId: '1',
            recieveId: this?.props?.route?.params?.data?.receiver,
            privateRoomId: this?.props?.route?.params?.data?.id,
          });
        } else {
          // exit group code
          this.setState({loading: true});
          const roomfrm = new FormData();
          roomfrm.append('room_id', this.props.route.params?.roomId);
          roomfrm.append('user_id', this.state.loginUserData?.id);
          await postAPICall(API.roomExit, roomfrm);
          let remainsChatRoomData = this.props.getGroupChatRoomData.data.filter(
            d => d.room_id !== this.props.route.params?.roomId,
          );
          let newChatObj = {
            ...this.props.getGroupChatRoomData,
            data: remainsChatRoomData,
          };
          this.setState({loading: false});
          this.props.getChatReoomsLocally(newChatObj);
          this.props.navigation.goBack();
        }
      } else if (index === 4) {
        this.props.navigation.replace('Tabs');
      }
    }, 500);
  };

  _runAnimation() {
    const {animated} = this.state;
    animated.setValue(0.8);
    Animated.loop(
      Animated.timing(animated, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ).start();
  }

  _stopAnimation() {
    const {animated} = this.state;
    animated.setValue(1);
  }

  onPressAnimation = () => {
    this.setState(state => ({isPressed: !state.isPressed}));
  };

  _micButton() {
    const {isPressed, animated, msg} = this.state;
    if (isPressed) {
      //some function
      return (
        <>
          <Animated.View
            style={[
              styles.micView,
              {
                transform: [
                  {
                    scale: animated,
                  },
                ],
              },
            ]}>
            {/* icon or image */}
            <Icon
              name={'mic'}
              size={scale(23)}
              color={theme.colors.blue}
              // style={styles.micStyle}
            />
          </Animated.View>
        </>
      );
    } else {
      return (
        <View style={styles.micView}>
          <Icon
            name={msg && msg.trim() !== '' ? 'send' : 'mic'}
            size={scale(23)}
            color={theme.colors.blue}
          />
        </View>
      );
    }
  }

  onStartRecord = async () => {
    const path = Platform.select({
      ios: undefined,
      android: undefined,
    });
    const audioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVEncoderAudioQualityKeyAndroid: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AudioChannelsAndroid: 1,
      SampleRateAndroid: 48000,
      Mode: 'music',
      AVFormatIDKeyIOS: AVEncodingOption.aac,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
    };
    const meteringEnabled = true;

    this.setState({isShowRecordLbl: true});
    await this.audioRecorderPlayer.startRecorder(
      path,
      audioSet,
      meteringEnabled,
    );
    this.audioRecorderPlayer.addRecordBackListener(async e => {
      const time = await this.millisToMinutesAndSeconds(e.currentPosition);
      this.setState({
        recordSecs: e.currentPosition,
        recordTime: time !== undefined ? time : '00:02',
        recording: true,
      });
    });
    this._runAnimation();
  };

  millisToMinutesAndSeconds = async millis => {
    var hour = Math.floor(millis / 60000);
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    const duration = `0${!isNaN(hour) ? hour : '0'}:0${
      !isNaN(minutes) ? minutes : '0'
    }:0${!isNaN(seconds) ? seconds : '0'}`;
    return duration;
    // return hour !== undefined || !isNaN(hour)
    //   ? hour
    //   : '0' + '0:' + minutes !== undefined || !isNaN(minutes)
    //   ? minutes
    //   : '0' +
    //       '0:' +
    //       (seconds !== undefined || (!isNaN(seconds) && seconds < 10)
    //         ? '0'
    //         : '') +
    //       seconds !==
    //       undefined || !isNaN(seconds)
    //   ? seconds
    //   : '';
  };

  onStopRecord = async () => {
    const {recordTime, animated} = this.state;
    animated.setValue(0);
    await this.setState({
      stopRecording: true,
      isShowRecordLbl: false,
    });
    this.audioRecorderPlayer.removeRecordBackListener();
    const result = await this.audioRecorderPlayer.stopRecorder();
    if (result) {
      this.setState({newFilePath: recordTime === '00:00:00' ? '' : result});
    }
    this.setState({
      recordSecs: 0,
    });
    this._stopAnimation();
  };

  onStartPlay = async () => {
    const {audioPlayDisableButton, duration} = this.state;
    this.setState({
      audioPlayButton: audioPlayDisableButton
        ? !this.state.audioPlayButton
        : this.state.audioPlayButton,
      audioPlayDisableButton: false,
    });
    this.setState({
      audioPlayDisableButton: true,
    });
    const path_file = this.state.newFilePath;
    await this.audioRecorderPlayer.startPlayer(path_file);
    this.audioRecorderPlayer.setVolume(5.0);
    this.audioRecorderPlayer.addPlayBackListener(e => {
      if (e.currentPosition === e.duration) {
        this.audioRecorderPlayer.stopPlayer();
      }
      this.setState({
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: this.audioRecorderPlayer.mmssss(
          Math.floor(e.currentPosition),
        ),
        duration: this.audioRecorderPlayer.mmssss(Math.floor(e.duration)),
      });
      if (this.state.currentPositionSec === this.state.currentDurationSec) {
        this.setState({
          audioPlayButton: true,
          audioPlayDisableButton: true,
          isAudioResume: false,
        });
      }
      if (this.state.currentPositionSec === duration) {
        this.setState({
          audioPlayButton: false,
          audioPlayDisableButton: false,
          isAudioResume: true,
        });
      }
    });
  };

  onPausePlay = async e => {
    const {audioPlayDisableButton} = this.state;
    this.setState({
      audioPlayButton: audioPlayDisableButton
        ? !this.state.audioPlayButton
        : this.state.audioPlayButton,
      audioPlayDisableButton: false,
    });
    this.setState({
      audioPlayDisableButton: true,
    });
    await this.audioRecorderPlayer.pausePlayer();
    if (this.state.currentPositionSec !== this.state.currentDurationSec) {
      this.setState({isAudioResume: true});
    }
  };

  onResumelay = async () => {
    const {audioPlayDisableButton} = this.state;
    this.setState({
      audioPlayButton: audioPlayDisableButton
        ? !this.state.audioPlayButton
        : this.state.audioPlayButton,
      audioPlayDisableButton: false,
    });
    this.setState({
      audioPlayDisableButton: true,
    });
    await this.audioRecorderPlayer.resumePlayer();
    if (this.state.currentPositionSec !== this.state.currentDurationSec) {
      this.setState({isAudioResume: false});
    }
  };

  onSendRecord = async () => {
    this.setState({
      isShowRecordLbl: false,
      isAudioResume: false,
      currentPositionSec: 0,
      currentDurationSec: 0,
    });
    this.audioRecorderPlayer.stopPlayer();
    this.audioRecorderPlayer.removePlayBackListener();
    const {newFilePath} = this.state;
    let audiofileData = imageData(newFilePath);

    const statResult = await stat(newFilePath);
    var file_path = newFilePath;
    if (Platform.OS === 'ios') {
      file_path = newFilePath.replace('file:///', '');
    } else {
      file_path = newFilePath;
    }

    const chunk = new ChunkUpload({
      path: file_path, // Path to the file
      size: 361728, // Chunk size (must be multiples of 3)
      fileName: audiofileData.name, // Original file name
      fileSize: statResult.size, // Original file size import RNFetchBlob from 'react-native-fetch-blob'
      // data: RNFetchBlob.wrap(decodeURIComponent(file_path)),
      // Errors
      onFetchBlobError: e => {},
      onWriteFileError: e => {},
    });
    chunk.digIn(this.upload.bind(this));
  };

  ondeleteAudio = () => {
    this.setState({
      newFilePath: '',
      stopRecording: false,
      isShowRecordLbl: false,
      isAudioResume: false,
      currentPositionSec: 0,
      currentDurationSec: 0,
    });
  };

  send() {
    this.setState({isShowRecordLbl: false});

    const {singleChatId} = this.state;
    if (this.state.msg.trim()) {
      this.socketConnect.emit(
        singleChatId === '1' ? 'conversation-message' : 'message',
        this.state.msg,
      );

      this.setState({msg: ''});
    }
  }

  // upload from gallray
  openImagePicker = async () => {
    await ImagePicker.openPicker({
      includeBase64: true,
      compressImageMaxHeight: 500,
      compressImageQuality: 1,
      compressImageMaxWidth: 500,
    })
      .then(async response => {
        let imagedata = imageData(response.path);
        var file_path = response.path;
        this.setState({imageChatPath: file_path, isMediaOption: false});
        if (Platform.OS === 'ios') {
          file_path = response.path.replace('file:///', '');
        } else {
          file_path = response.path;
        }
        const chunk = new ChunkUpload({
          path: file_path, // Path to the file
          size: 361728, // Chunk size (must be multiples of 3)
          fileName: imagedata.name, // Original file name
          fileSize: response.size, // Original file size
          // Errors
          onFetchBlobError: e => {},
          onWriteFileError: e => {},
        });
        chunk.digIn(this.upload.bind(this));
      })
      .catch(error => {
        openAttachment = false;
      });
  };

  openFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        // presentationStyle: 'fullScreen',
        allowMultiSelection: true,
      });

      const resp = Platform.OS === 'ios' ? res : res[0];
      var fileObj = {
        name: resp.name,
        type: resp.type,
        uri: resp.uri,
      };

      const body = new FormData();
      body.append('file', fileObj); // param name  //chat_id
      body.append(
        this.state.singleChatId === '1' ? 'chat_id' : 'room_id',
        this.state.singleChatId === '1'
          ? this?.props?.route?.params?.data?.id
          : this.props.route.params?.roomId,
      );
      body.append('user_id', this.state.loginUserData?.id);
      body.append('name', this.state.loginUserData?.first_name);
      body.append('user_pic', this.state.loginUserData?.user_pic?.small); //singleChatId === '1' ? 'conversation-upload-file' :
      const endPoint = 'https://frate.eugeniuses.com:3030/upload-file';
      const singleChatPoint =
        'https://frate.eugeniuses.com:3030/conversation-upload-file';
      this.setState({loading: true});
      axios
        .post(
          this.state.singleChatId === '1' ? singleChatPoint : endPoint,
          body,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              // Accept: 'application/json',
              // ...file.headers,
              'x-chunk-number': 1,
              'x-chunk-total-number': 1,
              // 'x-chunk-size': res.size,
              'x-file-name': resp.name,
              'x-file-size': resp.size,
              'x-file-identity': new Date().getTime(),
              'x-file-audio_duration': '',
              'x-file-type': resp.type,
            },
          },
        )
        .then(response => {
          openAttachment = false;
          switch (response.status) {
            case 200:
              this.setState({
                loading: false,
                newFilePath: '',
                stopRecording: false,
                isMediaOption: false,
              });
              break;
            case 201:
              // next();
              break;
          }
        })
        .catch(error => {
          openAttachment = false;
          if (error.response) {
            if ([400, 404, 415, 500, 501].includes(error.response.status)) {
              // unlink(file.path);
              this.setState({loading: false});
            } else if (error.response.status === 422) {
              // unlink(file.path);
              this.setState({loading: false});
            } else {
              // retry();
              this.setState({loading: false});
            }
          } else {
            // retry();
            this.setState({loading: false});
          }
        });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        openAttachment = false;
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
    this.setState({mediaOption: !this.state.mediaOption});
  };

  //upload in server
  upload(file, next, retry, unlink) {
    const body = new FormData();
    body.append('file', file.blob); // param name  //chat_id
    body.append(
      this.state.singleChatId === '1' ? 'chat_id' : 'room_id',
      this.state.singleChatId === '1'
        ? this?.props?.route?.params?.data?.id
        : this.props.route.params?.roomId,
    );
    body.append('user_id', this.state.loginUserData?.id);
    body.append('name', this.state.loginUserData?.first_name);
    body.append('user_pic', this.state.loginUserData?.user_pic?.small); //singleChatId === '1' ? 'conversation-upload-file' :
    const endPoint = 'https://frate.eugeniuses.com:3030/upload-file';
    const singleChatPoint =
      'https://frate.eugeniuses.com:3030/conversation-upload-file';

    this.setState({loading: true});
    axios
      .post(
        this.state.singleChatId === '1' ? singleChatPoint : endPoint,
        body,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            // Accept: 'application/json',
            ...file.headers,

            // 2️⃣ Customize the headers
            'x-chunk-number': file.headers['x-chunk-number'],
            'x-chunk-total-number': file.headers['x-chunk-total-number'],
            'x-chunk-size': file.headers['x-chunk-size'],
            'x-file-name': file.headers['x-file-name'],
            'x-file-size': file.headers['x-file-size'],
            'x-file-identity': file.headers['x-file-identity'],
            'x-file-audio_duration':
              this.state.recordTime === '00:00:00' ? '' : this.state.recordTime,
            'x-file-type': this.state.stopRecording ? 'audio' : '',
          },
        },
      )
      .then(response => {
        openAttachment = false;
        switch (response.status) {
          case 200:
            this.setState({
              loading: false,
              newFilePath: '',
              stopRecording: false,
            });
            break;
          case 201:
            next();
            break;
        }
      })
      .catch(error => {
        openAttachment = false;
        if (error.response) {
          if ([400, 404, 415, 500, 501].includes(error.response.status)) {
            unlink(file.path);
            this.setState({loading: false});
          } else if (error.response.status === 422) {
            unlink(file.path);
            this.setState({loading: false});
          } else {
            retry();
            this.setState({loading: false});
          }
        } else {
          retry();
          this.setState({loading: false});
        }
      });
  }

  cameraBackHandle = () => {
    this.setState({cameraModel: false, isMediaOption: false});
  };

  openVideoFiles = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
      multiple: true,
      includeExif: true,
      compressVideoPreset: '640x480',
    }).then(async video => {
      openAttachment = false;
      video.map(item => {
        if (item?.mime.slice(0, 5) === 'video') {
          let imagedata = imageData(item.path);
          var file_path = item.path;
          if (Platform.OS === 'ios') {
            file_path = item.path.replace('file:///', '');
          } else {
            file_path = item.path;
          }
          this.setState({isMediaOption: false, mediaOption: false});
          const chunk = new ChunkUpload({
            path: file_path, // Path to the file
            size: item.size, // Chunk size (must be multiples of 3)
            // size: Platform.OS === 'ios' ? 361728 : 36172885, // Chunk size (must be multiples of 3)
            fileName: imagedata.name, // Original file name
            // fileSize: mbToBytes, // Original file size
            fileSize: item.size, // Original file size
            // Errors
            onFetchBlobError: e => {},
            onWriteFileError: e => {},
          });
          chunk.digIn(this.upload.bind(this));

          // let videoName = imageData(
          //   Platform.OS === 'ios' ? item?.sourceURL : item?.path,
          // );
          // console.log('videoName', videoName, item);
          // this.setState({
          //   attachImages: [
          //     ...this.state.attachImages,
          //     {
          //       video: {
          //         uri: item?.path,
          //         name: videoName.name,
          //         type: item?.mime,
          //       },
          //     },
          //   ],
          //   mediaOption: false,
          //   isMediaOption: false,
          // });
        }
      });
    });
  };

  // Open Video
  openVideo = () => {
    ImagePicker.openCamera({
      mediaType: 'video',
      includeBase64: true,
      compressImageMaxHeight: 500,
      compressImageQuality: 1,
      compressImageMaxWidth: 500,
    }).then(image => {
      let imagedata = imageData(image.path);
      var file_path = image.path;
      if (Platform.OS === 'ios') {
        file_path = image.path.replace('file:///', '');
      } else {
        file_path = image.path;
      }
      this.setState({isMediaOption: false});
      const chunk = new ChunkUpload({
        path: file_path, // Path to the file
        size: image.size, // Chunk size (must be multiples of 3)
        // size: Platform.OS === 'ios' ? 361728 : 36172885, // Chunk size (must be multiples of 3)
        fileName: imagedata.name, // Original file name
        // fileSize: mbToBytes, // Original file size
        fileSize: image.size, // Original file size
        // Errors
        onFetchBlobError: e => {},
        onWriteFileError: e => {},
      });
      chunk.digIn(this.upload.bind(this));
    });
  };
  // open camera
  openCamera = () => {
    ImagePicker.openCamera({
      includeBase64: true,
      compressImageMaxHeight: 300,
      compressImageQuality: 1,
      compressVideoPreset: '640x480',
      compressImageMaxWidth: 300,
    }).then(image => {
      let imagedata = imageData(image.path);
      var file_path = image.path;
      if (Platform.OS === 'ios') {
        file_path = image.path.replace('file:///', '');
      } else {
        file_path = image.path;
      }
      this.setState({isMediaOption: false});
      const chunk = new ChunkUpload({
        path: file_path, // Path to the file
        size: 361728, // Chunk size (must be multiples of 3)
        fileName: imagedata.name, // Original file name
        fileSize: image.size, // Original file size
        // Errors
        onFetchBlobError: e => {},
        onWriteFileError: e => {},
      });
      chunk.digIn(this.upload.bind(this));
    });
  };

  previousindexset = index => {
    this.setState({previousIndex: index});
  };

  getFileExtention = fileUrl => {
    // To get the file extension
    return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : '';
  };

  checkPermission = async filePath => {
    if (Platform.OS === 'ios') {
      this.downloadFile(filePath);
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: getLocalText('Settings.storagetitle'),
            message: getLocalText('Settings.storagemessage'),
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // Start downloading
          this.downloadFile(filePath);
        } else {
          // If permission denied then show alert
          Alert.alert('Error', getLocalText('Settings.needstorage'));
        }
      } catch (err) {
        // To handle permission related exception
      }
    }
  };

  downloadFile = filePath => {
    Toast.show('Download start', Toast.SHORT);
    // Get today's date to add the time suffix in filename
    let date = new Date();
    // File URL which we want to download
    let FILE_URL = filePath; ///item?.pdf
    // Function to get extention of the file url
    let file_ext = this.getFileExtention(FILE_URL);
    file_ext = '.' + file_ext[0];
    // config: To get response by passing the downloading related options
    // fs: Root directory path to download
    const {config, fs} = RNFetchBlob;
    let RootDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path:
          RootDir +
          '/file_' +
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          file_ext,
        description: 'downloading file...',
        notification: true,
        // useDownloadManager works with Android only
        useDownloadManager: true,
      },
    };
    config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        // Alert after successful downloading
        Toast.show('File Downloaded Successfully.', Toast.SHORT);
      });
  };

  fileDownload = async item => {
    const {documentPath} = this.state;
    var filePath = `file://${documentPath}`;
    const configOptions = {fileCache: true, overwrite: true};
    const filename =
      item.type === 'Video'
        ? item?.url.substring(
            item?.url.lastIndexOf('/') + 1,
            item?.url.indexOf('?'),
          )
        : item?.fileName;

    if (await RNFS.exists(this.state.documentPath + filename)) {
      return filePath + filename;
    } else {
      if (item?.url) {
        return await RNFetchBlob.config(configOptions)
          .fetch('GET', item?.url)
          .then(async resp => {
            let downloadedPath = resp.path();
            await RNFS.copyFile(downloadedPath, documentPath + filename);
            return filePath + filename;
          });
      }
    }
    // } else {
    //   // Alert.alert('bad url passed');
    // }
  };

  //render chat data
  renderItem = ({item, index}) => {
    //"message_type": "pdf"
    const {userReciverData, singleChatId} = this.state;
    if (item?.message !== null) {
      if (item?.newjoin) {
        return this.state.newjoin ? (
          <>
            <View style={styles.messageCard}>
              <View style={[externalStyle.shadow, styles.new]}>
                <View style={styles.msgHeader}>
                  <View style={styles.userImgCon}>
                    <FastImage
                      source={item?.userImage}
                      style={styles.userPic}
                    />
                    <View style={[styles.alphabetView, externalStyle.shadow]}>
                      <Text
                        style={[
                          styles.receiveText,
                          {color: theme.colors.black},
                        ]}>
                        {item?.name.slice(0, 1)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Label
                      title={item?.name}
                      style={[styles.name, {color: theme.colors.black}]}
                    />
                    <Label
                      title={getLocalText('Chat.joingroup')}
                      style={styles.msgTxt}
                    />
                  </View>
                </View>
              </View>
            </View>
            {this.state.optionModal ? (
              <View style={styles.optionsCon}>
                {this.state.optins.map((od, oi) => {
                  return (
                    <TouchableOpacity
                      key={oi}
                      onPress={() => {
                        // this.handleAction(item?.message, oi);
                        Clipboard.setString(item?.message);
                        SimpleToast.show(getLocalText('Timeline.Copy'));
                      }}
                      style={[styles.row, styles.alignItem]}>
                      <Icon
                        size={scale(15)}
                        color={theme.colors.blue}
                        name={od.icon}
                      />
                      <Label title={od.title} style={{marginLeft: scale(10)}} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : null;
      } else if (
        parseInt(item?.user_id) !== parseInt(this.state.loginUserData?.id)
      ) {
        return (
          <>
            <View style={styles.leftMessageStyle}>
              {item?.message_type === 'Image' ? (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      modelData: {
                        // uri: baseUrl_chat + item?.attachment,
                        uri: item?.attachment,
                        mediaType: 'image',
                      },
                    });
                    this.setState({fullScreenMedia: true});
                  }}
                  style={styles.imageView}>
                  <Image
                    source={{
                      uri: item?.video_thumb,
                      priority: FastImage.priority.high,
                    }}
                    // source={{uri: item?.attachment}}
                    style={[styles.images]}
                    indicator={ProgressBar}
                  />
                  <Label
                    title={[moment(item?.created_at).format('hh :mm')]}
                    style={[
                      styles.time,
                      {
                        marginTop: scale(-20),
                        marginRight: scale(10),
                        color: theme.colors.white,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ) : item?.message_type === 'Audio' ? (
                <>
                  <AudioMsg
                    item={item}
                    audioindex={index}
                    handlePreviousIndex={() => {
                      this.previousindexset(index);
                    }}
                    url={item?.attachment}
                    style={styles.audioStyle}
                    audioId={item?.id}
                    userReciverData={userReciverData}
                    alphabet={true}
                    timeColor={theme.colors.grey1}
                    created_at={moment(item?.created_at).format('hh:mm')}
                    chatid={singleChatId}
                    previousIndex={this.state.previousIndex}
                  />
                </>
              ) : item?.message_type === 'Video' ? (
                <TouchableOpacity
                  onPress={() => {
                    this.setState(
                      {
                        modelData: {
                          // url: baseUrl_chat + item?.attachment,
                          url: item?.attachment,
                          mediaType: 'video',
                          thumbnail: item?.video_thumb,
                        },
                      },
                      () => {
                        this.setState({fullScreenMedia: true});
                      },
                    );
                  }}
                  style={[styles.images]}>
                  {/* <View>
                      <Image
                        source={{
                          uri: item?.video_thumb,
                        }}
                        style={styles.images}
                        indicator={ProgressBar}
                      />
                      <View
                        style={{
                          justifyContent: 'center',
                          flexDirection: 'row',
                          alignSelf: 'center',
                        }}>
                        <Icon name={'play'} size={scale(50)} color={'white'} />
                      </View>
                    </View> */}

                  <View style={styles.container}>
                    <View style={styles.backgroundContainer}>
                      <Image
                        source={{
                          uri: item?.video_thumb,
                        }}
                        style={styles.images}
                        indicator={ProgressBar}
                      />
                    </View>
                    <View style={styles.overlay}>
                      <Icon2
                        name={'play'}
                        size={scale(50)}
                        color={theme.colors.white}
                      />
                    </View>
                  </View>

                  {/* <VideoShow
                      // url={baseUrl_chat + item?.attachment}
                      url={item?.localFilePath}
                      chat={true}
                      thumbnail={item?.localFilePath}
                      // source={{uri: item?.localFilePath}}
                    /> */}
                  <Label
                    title={
                      item?.created_at === null
                        ? ''
                        : [moment(item?.created_at).format('hh :mm')]
                    }
                    style={[
                      styles.time,
                      {
                        marginTop: scale(-20),
                        color: theme.colors.white,
                        paddingHorizontal: 8,
                      },
                    ]}
                  />
                </TouchableOpacity>
              ) : item?.message_type === 'pdf' ||
                item?.message_type === 'Attachment' ? (
                <TouchableOpacity
                  style={{
                    width: theme.SCREENWIDTH * 0.45,
                    borderRadius: scale(20),
                    shadowColor: theme.colors.black,
                    paddingVertical: scale(7),
                    paddingHorizontal: scale(7),
                    marginBottom: scale(5),
                    backgroundColor: theme.colors.white,
                  }}
                  onPress={() => {
                    this.checkPermission(item?.attachment);
                  }}>
                  <View style={styles.rowCenter}>
                    <View style={styles.fileTextBoxView}>
                      <Icon
                        name="file-text"
                        color={theme.colors.white}
                        size={scale(18)}
                      />
                    </View>
                    <Label
                      title={item?.message}
                      style={[
                        {
                          fontSize: scale(12),
                          color: theme.colors.black,
                          marginLeft: scale(5),
                          width: scale(100),
                        },
                      ]}
                    />
                  </View>
                  <Label
                    title={
                      item?.created_at === null
                        ? ''
                        : moment(item?.created_at).format('hh:mm')
                    }
                    style={[styles.time, {color: theme.colors.black}]}
                  />
                </TouchableOpacity>
              ) : (
                item?.message && (
                  <TouchableOpacity
                    style={[
                      styles.msgBlock,
                      externalStyle.shadow,
                      {shadowRadius: scale(5)},
                    ]}
                    onPress={() => {
                      Clipboard.setString(item?.message);
                      SimpleToast.show(getLocalText('Timeline.Copy'));
                      // this.copiedText(index);
                    }}>
                    {this.state.singleChatId !== '1' && (
                      <View style={styles.msgHeader}>
                        <View style={styles.userImgCon}>
                          {/* <Image
                            source={
                              singleChatId === '1' &&
                              userReciverData?.user_pic?.optimize
                                ? {uri: userReciverData?.user_pic?.optimize}
                                : item?.user_image?.length === 0
                                ? images.profilepick
                                : {
                                    uri:
                                      item?.user_image?.optimize ||
                                      item?.user_image,
                                  }
                            }
                            style={styles.userPic}
                            // indicator={ProgressBar}
                          /> */}
                          <FastImage
                            source={
                              singleChatId === '1' &&
                              userReciverData?.user_pic?.optimize
                                ? {uri: userReciverData?.user_pic?.optimize}
                                : item?.user_image?.length === 0
                                ? images.profilepick
                                : {
                                    uri:
                                      item?.user_image?.optimize ||
                                      item?.user_image,
                                  }
                            }
                            style={styles.userPic}
                          />
                          <View
                            style={[styles.alphabetView, externalStyle.shadow]}>
                            <Text
                              style={[
                                styles.receiveText,
                                {color: theme.colors.black},
                              ]}>
                              {item?.user_name.slice(0, 1)}
                            </Text>
                          </View>
                        </View>

                        <Label
                          title={item?.user_name}
                          style={{
                            // color: theme.colors.black,
                            color: userReciverData?.color_hex
                              ? userReciverData?.color_hex
                              : theme.colors.black,
                            marginLeft: scale(13),
                          }}
                        />
                      </View>
                    )}
                    <Text style={[styles.msgTxt, {color: theme.colors.black}]}>
                      {item?.message}
                    </Text>
                    <Label
                      title={
                        item?.created_at === null
                          ? ''
                          : moment(item?.created_at).format('hh :mm')
                      }
                      style={[styles.time, {left: 10}]}
                    />
                  </TouchableOpacity>
                )
              )}
            </View>
            {this.state.optionModal && this.state.indexValue === index ? (
              <View style={[styles.optionsCon, styles.alignSelf]}>
                {this.state.optins.map((od, oi) => {
                  return (
                    <TouchableOpacity
                      key={oi}
                      onPress={() => {
                        // this.handleAction(item?.message, oi);
                        Clipboard.setString(item?.message);
                        SimpleToast.show(getLocalText('Timeline.Copy'));
                      }}
                      style={[styles.row, styles.alignItem]}>
                      <Icon
                        size={scale(15)}
                        color={theme.colors.blue}
                        name={od.icon}
                      />
                      <Label title={od.title} style={{marginLeft: scale(10)}} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </>
        );
      } else {
        return (
          item?.message && (
            <>
              <View style={styles.rightMsg}>
                {item?.message_type === 'Image' ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        modelData: {
                          // uri: baseUrl_chat + item?.attachment,
                          uri: item[0]
                            ? `chat/${item?.attachment}`
                            : item?.attachment,
                          mediaType: 'image',
                        },
                      });
                      this.setState({fullScreenMedia: true});
                    }}
                    style={styles.imageView}>
                    <FastImage
                      source={{
                        uri: item?.localFilePath || item.video_thumb,
                        priority: FastImage.priority.high,
                      }}
                      style={[styles.images]}
                      indicator={ProgressBar}
                    />
                    <Label
                      title={[
                        item?.created_at === null
                          ? ''
                          : moment(item?.created_at).format('hh :mm'),
                      ]}
                      style={[
                        styles.time,
                        {
                          marginTop: scale(-20),
                          marginRight: scale(10),
                          color: theme.colors.white,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ) : item?.message_type === 'Audio' ? (
                  <>
                    <AudioMsg
                      item={item}
                      audioindex={index}
                      handlePreviousIndex={() => {
                        this.previousindexset(index);
                      }}
                      url={item?.attachment}
                      style={{marginLeft: scale(5)}}
                      audioId={item?.id}
                      iconColor={true}
                      chatid={singleChatId}
                      timeColor={theme.colors.white}
                      previousIndex={this.state.previousIndex}
                      created_at={moment(item?.created_at).format('hh:mm')}
                    />
                    {/* <Label
                      title={
                        item?.created_at === null
                          ? ''
                          : moment(item?.created_at).format('hh:mm')
                      }
                      style={[styles.time, {color: theme.colors.grey1}]}
                    /> */}
                  </>
                ) : item?.message_type === 'Video' ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        modelData: {
                          // url: baseUrl_chat + item?.attachment,
                          url: item?.attachment,
                          mediaType: 'video',
                          thumbnail: item?.video_thumb,
                        },
                      });
                      this.setState({fullScreenMedia: true});
                    }}
                    style={[styles.images]}>
                    {/* <VideoShow
                      // url={baseUrl_chat + item?.attachment}
                      url={item?.attachment}
                      chat={true}
                      thumbnail={item?.video_thumb}
                    /> */}
                    {/* <Image
                      source={{
                        uri: item?.video_thumb,
                      }}
                      style={styles.images}
                      indicator={ProgressBar}
                    /> */}
                    <View style={styles.container}>
                      <View style={styles.backgroundContainer}>
                        <Image
                          source={{
                            uri: item?.video_thumb,
                          }}
                          style={styles.images}
                          indicator={ProgressBar}
                        />
                      </View>
                      <View style={styles.overlay}>
                        <Icon2
                          name={'play'}
                          size={scale(50)}
                          color={theme.colors.white}
                        />
                      </View>
                    </View>
                    <Label
                      title={[
                        item?.created_at === null
                          ? ''
                          : moment(item?.created_at).format('hh :mm'),
                      ]}
                      style={styles.sendVideoTime}
                    />
                  </TouchableOpacity>
                ) : item?.message_type === 'pdf' ||
                  item?.message_type === 'Attachment' ? (
                  <TouchableOpacity
                    style={{
                      width: theme.SCREENWIDTH * 0.45,
                      borderRadius: scale(20),
                      shadowColor: theme.colors.black,
                      paddingVertical: scale(7),
                      paddingHorizontal: scale(7),
                      marginBottom: scale(5),
                      backgroundColor: theme.colors.blue,
                    }}
                    onPress={() => {
                      this.checkPermission(item?.attachment);
                    }}>
                    <View style={styles.rowCenter}>
                      <View
                        style={[
                          styles.fileTextBoxView,
                          {
                            backgroundColor: theme.colors.white,
                          },
                        ]}>
                        <Icon
                          name="file-text"
                          color={theme.colors.blue}
                          size={scale(18)}
                        />
                      </View>
                      <Label
                        title={item?.message}
                        numberOfLines={2}
                        style={[
                          {
                            fontSize: scale(12),
                            color: theme.colors.white,
                            marginLeft: scale(5),
                            width: scale(100),
                          },
                        ]}
                      />
                    </View>
                    <Label
                      title={
                        item?.created_at === null
                          ? ''
                          : moment(item?.created_at).format('hh:mm')
                      }
                      style={[styles.time, {color: theme.colors.white}]}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.msgBlock,
                      externalStyle.shadow,
                      {
                        shadowRadius: scale(5),
                        backgroundColor: theme.colors.blue,
                      },
                    ]}
                    onPress={() => {
                      // this.copiedText(index);
                      Clipboard.setString(item?.message);
                      SimpleToast.show(getLocalText('Timeline.Copy'));
                    }}>
                    {item?.message_type === 'Image' ? (
                      <FastImage
                        source={
                          (item?.attachment === null
                            ? images.profilepick
                            : {
                                //   item?.attachment,
                                uri: item?.attachment,
                              },
                          {priority: FastImage.priority.high})
                        }
                        style={styles.images}
                      />
                    ) : (
                      <Text style={[styles.msgTxt]}>{item?.message}</Text>
                    )}
                    <Label
                      title={
                        item?.created_at === null
                          ? ''
                          : moment(item?.created_at).format('hh:mm')
                      }
                      style={[
                        styles.time,
                        {color: theme.colors.white, left: 10},
                      ]}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {this.state.optionModal && this.state.indexValue === index ? (
                <View style={styles.optionsCon}>
                  {this.state.optins.map((od, oi) => {
                    return (
                      <TouchableOpacity
                        key={oi}
                        onPress={() => {
                          // this.handleAction(item?.message, oi);
                          Clipboard.setString(item?.message);
                          SimpleToast.show(getLocalText('Timeline.Copy'));
                        }}
                        style={[styles.row, styles.alignItem]}>
                        <Icon
                          size={scale(15)}
                          color={theme.colors.blue}
                          name={od.icon}
                        />
                        <Label
                          title={od.title}
                          style={{marginLeft: scale(10)}}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </>
          )
        );
      }
    }
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
      }, 700);
    }
  };
  closeReportDetails = async (details, reason) => {
    this.setState({
      reportDetails: !this.state.reportDetails,
    });
    let reportGroupForm = new FormData();
    if (details || reason) {
      if (this.state.singleChatId === '1') {
        reportGroupForm.append('chat_id', this?.props?.route?.params?.data?.id);
        reportGroupForm.append('user_id', this.state.loginUserData?.id);
        reportGroupForm.append(
          'blocked_user_id',
          this.state.userReciverData?.id,
        );
        reportGroupForm.append('reason', reason);
        reportGroupForm.append('report_detail', details);
        reportGroupForm.append('status', 0);
        await this.props.reportChat(reportGroupForm);
      } else {
        reportGroupForm.append('group_id', this.state.groupDetails?.group_id);
        reportGroupForm.append('type', BLOCKTYPES.REPORT_GROUP);
        reportGroupForm.append('details', details);
        reportGroupForm.append('reason', reason);

        await this.props.reportGroup(reportGroupForm);
      }
      const reportPayload =
        this.state.singleChatId === '1'
          ? this.props.reportChatPayload?.success
          : this.props.reportGroupPayload?.success;

      if (reportPayload) {
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

  setEmoji = emoji => this.setState({msg: this.state.msg + emoji.emoji});

  onPressKeybord() {
    this.textinput.focus();
    this.setState({isEmojiKeyboard: false});
    Keyboard.dismiss();
  }

  backPress = () => {
    this.socketConnect.disconnect('disconnect', () => {});
    this.socketConnect.close();
    this.props.navigation.goBack();
  };

  onPressProfile = () => {
    if (this.state.singleChatId === '1') {
      this.props.navigation.navigate('UserDataSpecific', {
        data: this.state?.userReciverData?.id,
        id: this.state?.userReciverData?.id,
        screenName: SCREEN_TYPE.NEW_USER,
      });
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

  loadMore = async () => {
    const {messages} = this.state;
    if (messages.length) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let chatData =
            this.state.singleChatId === '1'
              ? await this.callPersonalChatApi(page)
              : await this.callGroupChatApi(page);
          if (chatData.success) {
            let messagesData = [...this.state.messages, ...chatData.data];
            this.setState({
              messages: messagesData,
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

  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});
    if (this.state.singleChatId === '1') {
      this.readPrivateChatMessage(true);
    } else {
      this.chatHistory(true);
    }
  };

  renderFooter = () => {
    if (this.state.loadmore) {
      return (
        <ActivityIndicator
          size="large"
          color={theme.colors.blue}
          style={{marginTop: scale(10)}}
        />
      );
    }
    return null;
  };

  render() {
    const {
      msg,
      messages,
      groupDetails,
      userDetails,
      stopRecording,
      userReciverData,
      audioPlayButton,
      roomData,
      currentDurationSec,
      currentPositionSec,
      audioPlayDisableButton,
      mediaIconShown,
      isAudioResume,
    } = this.state;
    const {reportReasonList} = this.props;
    let playWidth =
      (currentPositionSec / currentDurationSec) * (theme.SCREENWIDTH - 56);

    if (!playWidth) {
      playWidth = 0;
    }
    const name = `${userReciverData?.first_name} ${userReciverData?.last_name}`;
    const listHeight = this.state.isEmojiKeyboard
      ? Platform.OS === 'ios'
        ? isIphoneX()
          ? theme.SCREENHEIGHT * 0.82
          : theme.SCREENHEIGHT * 0.76
        : theme.SCREENHEIGHT * 0.65
      : this.state.keybordStatus
      ? theme.SCREENHEIGHT * 0.76
      : theme.SCREENHEIGHT * 0.78;
    const listBottomMargin = this.state.isEmojiKeyboard
      ? Platform.OS === 'ios'
        ? isIphoneX()
          ? scale(70)
          : scale(20)
        : scale(70)
      : isIphoneX()
      ? scale(82)
      : this.state.keybordStatus
      ? scale(88)
      : scale(65);
    const textInputBottom = this.state.isEmojiKeyboard
      ? Platform.OS === 'android'
        ? '41.5%'
        : isIphoneX()
        ? '41.5%'
        : '38.5%'
      : this.state.keybordStatus
      ? Platform.OS === 'android'
        ? scale(55)
        : isIphoneX()
        ? scale(25)
        : scale(32)
      : Platform.OS === 'android'
      ? scale(10)
      : isIphoneX()
      ? scale(23)
      : scale(0);
    return (
      <ScreenContainer style={styles.mainView}>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          backPress
          backPressHandle={this.backPress}
          option={true}
          optionHandler={() => this.setState({menu: !this.state.menu})}
          title={
            userDetails !== undefined || userReciverData !== undefined
              ? userDetails?.member_name || userDetails?.first_name || name
              : groupDetails?.room_title
          }
          navigateScreen={this.onPressProfile}
          {...this.props}
          headerViewStyle={[styles.header]}
          subHeader={
            this.state.singleChatId === '1' ? null : (
              <GroupImages
                groupImagesView={{marginLeft: scale(60), marginTop: scale(8)}}
                members={
                  userDetails !== undefined ? null : roomData || groupDetails
                }
                InteractionsDetails={false}
              />
            )
          }
        />
        <KeyboardAvoidingView
          // enabled={true}
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={
            Platform.OS === 'ios'
              ? isIphoneX()
                ? scale(-32)
                : scale(-20)
              : scale(-25)
          }>
          <FlatList
            ref={ref => (this.FlatListRef = ref)}
            inverted={true}
            style={[
              // styles.list,
              {
                height:
                  this.state.singleChatId === '1'
                    ? listHeight
                    : Platform.OS === 'ios'
                    ? listHeight - scale(30)
                    : listHeight - 30,
                marginBottom:
                  this.state.singleChatId === '1'
                    ? listBottomMargin
                    : this.state.isEmojiKeyboard
                    ? Platform.OS === 'ios'
                      ? listBottomMargin - scale(20)
                      : listBottomMargin
                    : this.state.keybordStatus && Platform.OS === 'android'
                    ? listBottomMargin + scale(26)
                    : listBottomMargin,
              },
            ]}
            contentContainerStyle={[
              styles.listStyle,
              {
                top: this.state.isEmojiKeyboard
                  ? theme.SCREENHEIGHT / 3
                  : scale(0),
                paddingBottom: this.state.keybordStatus ? scale(0) : scale(20),
              },
            ]}
            showsVerticalScrollIndicator={false}
            extraData={[this.state, this.props]}
            data={messages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={this.renderItem}
            onScrollBeginDrag={() => {
              this.setState({isEmojiKeyboard: false});
            }}
            onScroll={e => {
              this.setState({isEmojiKeyboard: false});
            }}
            // refreshControl={
            //   <RefreshControl
            //     refreshing={this.state.refreshing}
            //     onRefresh={this.handleRefresh}
            //   />
            // }
            ListFooterComponent={this.renderFooter.bind(this)}
            onEndReachedThreshold={0.1}
            onEndReached={this.loadMore}
          />

          <View
            onLayout={e => {
              this.setState({viewYposition: e.nativeEvent.layout.y});
            }}
          />

          {stopRecording && this.state.newFilePath ? (
            <View
              style={[
                styles.inputIcon,
                {
                  bottom:
                    this.state.isEmojiKeyboard || this.state.keybordStatus
                      ? Platform.OS === 'android'
                        ? '45%'
                        : isIphoneX()
                        ? '38%'
                        : '50%'
                      : scale(30),
                },
              ]}>
              <View style={[styles.viewBarWrapper, {width: scale(160)}]}>
                <Slider
                  minimumValue={0}
                  maximumValue={currentDurationSec}
                  value={currentPositionSec}
                  style={styles.viewBar}
                  thumbTintColor={theme.colors.blue}
                  maximumTrackTintColor={theme.colors.grey} // iconColor ? theme.colors.blue1 : theme.colors.grey
                  minimumTrackTintColor={theme.colors.blue}
                  thumbTouchSize={{width: 10, height: 10}}
                  onSlidingComplete={data => {}}
                />
              </View>
              <View style={[styles.playRowView]}>
                <TouchableOpacity
                  style={styles.playRowContainer}
                  onPress={() => {
                    if (audioPlayDisableButton) {
                      if (audioPlayButton) {
                        if (isAudioResume) {
                          this.onResumelay();
                        } else {
                          this.onStartPlay();
                        }
                      } else {
                        this.onPausePlay();
                      }
                    }
                  }}>
                  <Icon
                    name={audioPlayButton ? 'play' : 'pause'}
                    size={scale(23)}
                    color={theme.colors.blue}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.playRowContainer}
                  onPress={() => {
                    this.ondeleteAudio();
                  }}>
                  <Icon
                    name={'trash-2'}
                    size={scale(23)}
                    color={theme.colors.blue}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playRowContainer]}
                  onPress={() => {
                    this.onSendRecord();
                  }}>
                  <Icon
                    name={'send'}
                    size={scale(23)}
                    color={theme.colors.blue}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {this.state.isShowRecordLbl ? (
                <View style={styles.containRecord}>
                  <Label
                    title={getLocalText('Chat.recordingStart')}
                    style={styles.recordLbl}
                  />
                </View>
              ) : null}
              <View
                style={[
                  styles.inputIcon,
                  {
                    bottom:
                      this.state.singleChatId !== '1' &&
                      this.state.isEmojiKeyboard &&
                      Platform.OS === 'android'
                        ? '42.5%'
                        : textInputBottom,
                  },
                ]}>
                <View
                  style={[
                    styles.inputSub,
                    externalStyle.shadow,
                    {shadowRadius: scale(3)},
                  ]}>
                  {!this.state.isEmojiKeyboard ? (
                    <TouchableOpacity onPress={this.handleEmojiKeboard}>
                      <Icon
                        name={'smile'}
                        color={theme.colors.darkGrey}
                        size={scale(20)}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        this.onPressKeybord();
                      }}>
                      <Icon1
                        name={'keyboard'}
                        color={theme.colors.grey6}
                        size={scale(20)}
                      />
                    </TouchableOpacity>
                  )}

                  <TextInput
                    value={msg}
                    placeholder={getLocalText('Chat.writemsg')}
                    placeholderTextColor={theme.colors.grey18}
                    onChangeText={txt => {
                      // this.FlatListRef.scrollToEnd();
                      this.setState({msg: txt});
                    }}
                    onFocus={() => this.setState({isEmojiKeyboard: false})}
                    style={[
                      styles.writeText,
                      {
                        width: msg ? '78.5%' : '68%',
                      },
                    ]}
                    ref={ref => (this.textinput = ref)}
                    // autoFocus={true}
                  />

                  {msg ? null : (
                    <TouchableOpacity
                      style={{left: scale(-5)}}
                      onPress={() => {
                        this.setState({
                          cameraModel: true,
                          mediaIconShown: false,
                        });
                      }}>
                      <Icon
                        name={'camera'}
                        size={scale(20)}
                        color={theme.colors.darkGrey}
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={{left: scale(-2)}}
                    onPress={() => {
                      this.setState({cameraModel: true, mediaIconShown: true});
                    }}>
                    <Icon
                      name={'paperclip'}
                      size={scale(20)}
                      color={theme.colors.darkGrey}
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[
                    styles.btnMic,
                    externalStyle.shadow,
                    {shadowRadius: scale(3)},
                  ]}
                  onPress={
                    msg && msg.trim() !== ''
                      ? () => this.send() && this.setState.msg === ''
                      : null
                  }
                  onPressIn={() =>
                    msg === ''
                      ? this.onStartRecord() || this.onPressAnimation()
                      : null
                  }
                  onPressOut={() => {
                    if (msg === '') {
                      this.onStopRecord();
                    }
                  }}>
                  {!this.state.isPressed ? (
                    <>{this._micButton()}</>
                  ) : (
                    <>
                      <Icon
                        name={'send'}
                        size={scale(23)}
                        color={theme.colors.blue}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </KeyboardAvoidingView>
        <Menus
          isMenu={this.state.menu}
          menuData={
            this.state.singleChatId === '1'
              ? this.state.chatOption
              : this.state.options
          }
          handleMenu={this.handleOptions}
        />
        <FullMediaModel
          isShow={this.state.fullScreenMedia}
          index={0}
          closeModel={this.handleClose}
          postImages={this.state.modelData}
        />
        <ReportModel
          isVisible={this.state.reportModel}
          toggleReportmodel={this.closeReport}
          data={this.props.route.params?.groupData || userReciverData}
          reportGroup={this.state.singleChatId !== '1'}
          reportPerson={this.state.singleChatId === '1'}
        />
        <ReportDetailsModel
          show={this.state.reportDetails}
          closeModal={this.closeReportDetails}
          reasonList={reportReasonList}
          id={this.state.singleChatId}
          reportType={
            this.state.singleChatId !== '1' && BLOCKTYPES.REPORT_GROUP
          }
          postData={true}
        />
        <PostponedModel
          isVisible={this.state.postPone}
          close={this.closePostpone}
          id={this.state.singleChatId}
        />
        <EmojiPicker
          onEmojiSelected={this.setEmoji}
          open={this.state.isEmojiKeyboard}
          onClose={() => this.setState({isEmojiKeyboard: false})}
        />
        {/* <EmojiBoard
          showBoard={this.state.isEmojiKeyboard}
          onClick={this.setEmoji}
          onRemove={() => {
            var str = this.safeEmojiBackspace(this.state.msg);
            this.setState({msg: str});
          }}
          hideBackSpace={false}
          onClose={() => this.setState({isEmojiKeyboard: false})}
          // containerStyle={{
          //   height: scale(210),
          //   width: scale(360),
          // }}
          // tabBarPosition="scroll"
        /> */}
        <Loader loading={this.state.loading} />

        <ChatMediaOption
          isVisible={this.state.cameraModel}
          close={this.cameraBackHandle}
          mediaShow={mediaIconShown}
          onPressCamera={() => {
            this.setState({cameraModel: false, isMediaOption: true});
            setTimeout(() => {
              this.openCamera();
            }, 500);
          }}
          onPressVideo={() => {
            this.setState({cameraModel: false, isMediaOption: true});
            setTimeout(() => {
              this.openVideo();
            }, 500);
          }}
          onPressOpenVideo={() => {
            this.setState({cameraModel: false, isMediaOption: true});
            setTimeout(() => {
              this.openVideoFiles();
            }, 500);
          }}
          onPressFile={() => {
            this.setState({cameraModel: false, isMediaOption: true});
            setTimeout(() => {
              this.openFile();
            }, 500);
          }}
          onPressGallery={() => {
            this.setState({cameraModel: false, isMediaOption: true});
            setTimeout(() => {
              this.openImagePicker();
            }, 500);
          }}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.37),
    right: -(theme.SCREENHEIGHT * 0.27),
    transform: [{rotate: '37deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.25),
    right: -(theme.SCREENHEIGHT * 0.49),
    transform: [{rotate: '3deg'}],
  },
  keyboardView: {
    flex: 1,
    paddingBottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  listStyle: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(15),
  },
  header: {zIndex: 111},
  row: {flexDirection: 'row'},
  images: {
    height: scale(150),
    width: scale(150),
    resizeMode: 'cover',
  },
  imageView: {padding: 5},
  text: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    color: theme.colors.grey10,
  },
  list: {
    height: theme.SCREENHEIGHT * 0.8,
    marginTop: scale(5),
  },
  inputIcon: {
    position: 'absolute',
    flexDirection: 'row',
    zIndex: 1,
  },
  inputSub: {
    height: scale(50),
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: scale(25),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
    marginRight: scale(8),
  },
  btnMic: {
    height: scale(50),
    width: scale(50),
    borderRadius: scale(25),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageCard: {
    marginVertical: scale(5),
    zIndex: -111,
  },
  leftMessageStyle: {
    alignSelf: 'flex-start',
    marginVertical: scale(5),
    zIndex: -111,
  },
  msgBlock: {
    borderRadius: scale(12),
    backgroundColor: theme.colors.white,
    shadowColor: theme.colors.black,
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
  },
  rightMsg: {
    alignSelf: 'flex-end',
    marginVertical: scale(5),
  },
  msgTxt: {
    color: theme.colors.white,
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
  },
  time: {
    alignSelf: 'flex-end',
    color: theme.colors.grey6,
    fontSize: scale(11),
    // left: 10,
  },
  sendVideoTime: {
    alignSelf: 'flex-end',
    fontSize: scale(11),
    marginTop: scale(-20),
    color: theme.colors.white,
    right: 6,
  },
  msgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  userImgCon: {
    borderColor: theme.colors.grey10,
    borderWidth: 2,
    padding: scale(1),
    borderRadius: scale(17),
  },
  userPic: {
    height: scale(30),
    width: scale(30),
    resizeMode: 'cover',
    borderRadius: scale(15),
  },
  alphabetView: {
    width: scale(18),
    height: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: scale(9),
    backgroundColor: theme.colors.white,
    bottom: -scale(8),
    right: -scale(8),
  },
  receiveText: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  name: {
    marginLeft: scale(10),
    marginRight: scale(10),
  },
  newJoin: {shadowRadius: scale(5), width: '85%'},
  optionsCon: {
    alignSelf: 'flex-end',
    padding: scale(6),
    paddingHorizontal: scale(55),
    backgroundColor: theme.colors.white,
    position: 'absolute',
    zIndex: 111,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
    borderRadius: scale(5),
  },
  alignItem: {
    alignItems: 'center',
  },
  audioStyle: {
    alignSelf: 'flex-start',
  },
  writeText: {
    fontSize: scale(14),
    marginBottom:Platform.OS === 'android' ? scale(2) : 0,
  },
  alignSelf: {
    alignSelf: 'center',
  },
  viewBarWrapper: {
    marginTop: 28,
    marginHorizontal: 28,
    alignSelf: 'stretch',
  },
  viewBar: {
    backgroundColor: '#ccc',
    height: 4,
    alignSelf: 'stretch',
  },
  playRowView: {
    shadowRadius: scale(3),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    borderRadius: scale(25),
    margin: scale(5),
  },
  playRowContainer: {
    height: scale(40),
    width: scale(40),
    backgroundColor: theme.colors.white,
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  micView: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micStyle: {
    padding: 15,
    position: 'absolute',
  },
  containRecord: {
    position: 'absolute',
    justifyContent: 'flex-end',
    borderRadius: scale(10),
    zIndex: 111,
    height: '100%',
    alignSelf: 'flex-end',
    right: scale(50),
    bottom: scale(10),
  },
  recordLbl: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileTextBoxView: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(100),
    marginLeft: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  overlay: {
    opacity: 0.5,
    marginTop: scale(55),
    justifyContent: 'center',
  },
  logo: {
    backgroundColor: 'rgba(0,0,0,0)',
    width: 160,
    height: 52,
  },
  backdrop: {
    flex: 1,
    flexDirection: 'column',
  },
  headline: {
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'black',
    color: 'white',
  },
});

const mapStateToProps = state => {
  const userData = state.UserInfo.data;
  const video = state.videoReducer;
  const reportReasonList = state.PostReducer.reportReasonList;
  const reportGroupPayload = state.groupsReducer.reportGroupPayload;
  const reportChatPayload = state.groupsReducer.reportChatPayload;

  const {getGroupChatRoomData} = state.PostReducer;

  return {
    userData,
    video,
    reportReasonList,
    getGroupChatRoomData,
    reportGroupPayload,
    reportChatPayload,
  };
};
export default connect(mapStateToProps, {
  reportGroup,
  suspendRoomNotication,
  reportChat,
  getChatReoomsLocally,
})(Chat);
