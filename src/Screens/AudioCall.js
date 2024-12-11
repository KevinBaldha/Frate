import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import {mediaDevices} from 'react-native-webrtc';
import Peer from 'react-native-peerjs';
import io from 'socket.io-client';
import {connect} from 'react-redux';
import {isIphoneX} from 'react-native-iphone-x-helper';
import externalStyle from '../Css';
import InCallManager from 'react-native-incall-manager';
import {
  ScreenContainer,
  BackgroundChunk,
  HeaderView,
  Menus,
  Label,
  ReportModel,
  ReportDetailsModel,
  PostponedModel,
  Loader,
  AudioModel,
} from '../Components';
import {images, scale, theme} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {BLOCKTYPES} from '../Utils/StaticData';
import {reportGroup, suspendRoomNotication} from '../Redux/Actions';
import {API, getAPICall} from '../Utils/appApi';

class AudioCall extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: false,
      groupData: this.props.route.params?.groupData,
      userDetails:
        this.props.route.params?.userData !== undefined
          ? this.props.route.params?.userData
          : undefined,
      options: [
        {icon: 'info', name: getLocalText('Chat.groupinfo')},
        {icon: 'bell', name: getLocalText('Chat.notification')},
        {icon: 'alert-triangle', name: getLocalText('Report.reporttxt')},
        {icon: 'block-helper', name: getLocalText('Report.block')},
        {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
      ],
      userList: [],
      userMute: false,
      reportModel: false,
      reportDetails: false,
      blockModel: false,
      blockDetailsModel: false,
      postPoneBlock: false,
      postPone: false,
      streamData: '',
      streamUrl: '',
      remoteStreamUrl: null,
      loadding: false,
      closeIcon: true,
      roomData: '',
      uid: '',
      uname: '',
      audioMuteModel: false,
      audioUserItem: null,
      userIndex: -1,
      audioMuteIcon: false,
      muteAll: false,
    };
  }
  

  handleOptions = (index) => {
    this.setState({menu: !this.state.menu});
    setTimeout(() => {
      if (index === 0) {
        this.props.navigation.navigate('GroupInformation', {
          groupData: this.state.groupData,
          userLists: this.props.route.params?.members,
        });
      } else if (index === 1) {
        this.props.suspendRoomNotication(this.props.route.params?.roomId);
      } else if (index === 2) {
        this.setState({reportModel: true});
      } else if (index === 3) {
        this.setState({blockModel: true});
      }else if (index === 4) {
        this.props.navigation.replace('Tabs');
      }
    }, 700);
  };
  closeReport = (item) => {
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
  closeBlock = (item) => {
    console.log('item ->', item);
    
    if (item === null) {
      this.setState({
        blockModel: !this.state.blockModel,
      });
    } else {
      this.setState({
        blockModel: !this.state.blockModel,
      });
      setTimeout(() => {
        this.setState({
          blockDetailsModel: !this.state.blockDetailsModel,
        });
      }, 700);
    }
  };
  closeReportDetails = async (details, resion) => {
    this.setState({
      reportDetails: !this.state.reportDetails,
    });
    let reportGroupForm = new FormData();
    reportGroupForm.append('group_id', this.state.groupData.id);
    reportGroupForm.append('type', BLOCKTYPES.REPORT_GROUP);
    reportGroupForm.append('details', details);
    reportGroupForm.append('reason', resion);
    await this.props.reportGroup(reportGroupForm);
    if (this.props.reportGroupPayload?.success) {
      setTimeout(() => {
        this.setState({
          postPone: !this.state.postPone,
        });
      }, 700);
    }
  };
  closeBlockDetails = async (details, reason) => {
    console.log('details ->', details);
    console.log('reason ->', reason);
    this.setState({
      blockDetailsModel: !this.state.blockDetailsModel,
    });
    let reportGroupForm = new FormData();
    reportGroupForm.append('group_id', this.state.groupData.id);
    reportGroupForm.append('type', BLOCKTYPES.REPORT_GROUP);
    reportGroupForm.append('details', details);
    reportGroupForm.append('reason', reason);
    reportGroupForm.append('is_blocked', 1);
    console.log('reportGroupForm ->', reportGroupForm);
    await this.props.reportGroup(reportGroupForm);
    if (this.props.reportGroupPayload?.success) {
      setTimeout(() => {
        this.setState({
          postPoneBlock: !this.state.postPoneBlock,
        });
      }, 700);
    }
  };
  closePostpone = () => {
    this.setState({postPone: false});
  };
  closePostponeBlock = () => {
    this.setState({postPoneBlock: false});
  };
  componentDidMount() {
    this.initAudioCall();
    this.getRoomInfo();
  }

  // get information of audio room
  getRoomInfo = async () => {
    let roomDetails = await getAPICall(
      API.roomDetails + this.props.route.params.roomId,
    );
    if (roomDetails.success) {
      this.setState({
        roomData: roomDetails?.data,
      });
    } else {
      Alert.alert(getLocalText('ErrorMsgs.Room_close'));
      this.props.navigation.navigate('Timeline');
      this.setState({loadding: false});
    }
  };

  //setup audio call
  initAudioCall() {
    const {navigation} = this.props;
    let userId = this.props.userData?.id;
    let userName = this.props.userData?.first_name;
    this.setState({uid: userId, uname: userName});
    const UserId = this.props.userData.id;
    const RoomId = this.props.route.params.roomId;
    let userImage = this.props?.userData?.user_pic?.optimize;
    this.setState({loadding: true});
    InCallManager.start();
    InCallManager.setKeepScreenOn(true);
    InCallManager.setSpeakerphoneOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    this.focusListener = navigation.addListener('blur', async () => {
      this.socketConnect.close();
      this.setState({remoteStreamUrl: null});
      this.peer.destroy();
    });
    this.socketConnect = io.connect('https://frate.eugeniuses.com:3030', {
      secure: true,
      reconnection: true,
      rejectUnauthorized: false,
      reconnectionAttempts: 10,
      forceNew: true,
      multiplex: false,
    });
    this.socketConnect.on('connect_error', () => {});

    this.socketConnect.on('error', () => {});

    this.socketConnect.on('user-disconnected', (uid, uname) => {
      this.peer[uid]?.close();
    });

    this.socketConnect.on('connect', () => {
      this.brokeringId = null;

      this.peer = new Peer(this.brokeringId, {
        path: '/peerjs',
        host: 'frate.eugeniuses.com',
        port: '3030',
        secure: true,
        debug: false,
      });

      this.socketConnect.on('leave-chat', () => {
        this.socketConnect.close();
        this.props.navigation.goBack();
      });
      this.peer.on('error', () => {});

      this.peer.on('open', (id) => {
        this.brokeringId = id;
        mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: false,
              mozAutoGainControl: false,
            },
            video: false,
          })
          .then((stream) => {
            this.myVideoStream = stream;
            this.peer.on('call', (call) => {
              call.answer(stream);
              call.on('stream', (remoteStream) => {
                let new_stream = {
                  ...this.state.remoteStreamUrl,
                  ...remoteStream,
                };
                var streamArray = this.state.remoteStreamUrl;
                if (streamArray) {
                  streamArray.push(remoteStream);
                }
                this.setState({remoteStreamUrl: new_stream});
              });
            });

            this.socketConnect.emit(
              'join-room',
              RoomId,
              this.brokeringId,
              UserId,
              this.props.userData.first_name,
              userImage,
            );
            this.socketConnect.emit(
              'connection-request',
              RoomId,
              this.brokeringId,
              UserId,
              this.props.userData.first_name,
              userImage,
            );
            this.socketConnect.on('user-connected', (userBrokeringId) => {
              this.setState({closeIcon: true});
              this.socketConnect.on(
                'new-user-connected',
                (remoteBrokeringId, userIds) => {
                  if (parseInt(userIds) !== parseInt(UserId)) {
                    this.connectToNewUser(remoteBrokeringId, stream, userIds);
                  }
                },
              );
            });
          })
          .catch();
        this.socketConnect.on('participants', (users) => {
          if (users) {
            this.setState({userList: users, loadding: false});
          } else {
            this.setState({loadding: true});
          }
          //
        });
        this.socketConnect.on('mute-audio', (d) => {
          this.socketConnect.emit('mute-mic');
          this.myVideoStream.getAudioTracks()[0].enabled = false;
        });
        this.socketConnect.on('unmute-audio', () => {
          this.socketConnect.emit('unmute-mic');
          this.myVideoStream.getAudioTracks()[0].enabled = true;
        });
        this.socketConnect.on('mute-user', (response) => {});
        this.socketConnect.on('mute-users', (response) => {});
      });
    });
  }

  onPressMuteUser = (id, index, value) => {
    this.setState({audioMuteModel: !this.state.audioMuteModel});
    if (this.state.roomData?.creator_id === this.props.userData?.id) {
      const RoomId = this.props.route.params.roomId;
      if (value === '2') {
        this.socketConnect.emit('mute-user', RoomId, id);
        this.setState({audioMuteIcon: true});
      } else {
        this.socketConnect.emit('unmute-user', RoomId, id);
        this.setState({audioMuteIcon: false});
      }
    }
  };

  handleAllUserMute = () => {
    const {roomData, userList, muteAll} = this.state;
    const {userData} = this.props;
    if (roomData?.creator_id === userData?.id) {
      const RoomId = this.props.route.params.roomId;
      let allUserId = userList.map((a) => a.id);
      if (!muteAll) {
        this.socketConnect.emit('mute-users', RoomId, allUserId);
        this.setState({muteAll: true});
      } else {
        this.socketConnect.emit('unmute-users', RoomId, allUserId);
        this.setState({muteAll: false});
      }
    }
  };

  handleMute = () => {
    if (!this.state.userMute) {
      this.socketConnect.emit('mute-mic');
      this.myVideoStream.getAudioTracks()[0].enabled = false;
    } else {
      this.socketConnect.emit('unmute-mic');
      this.myVideoStream.getAudioTracks()[0].enabled = true;
    }
  };

  connectToNewUser = (remoteBrokeringId, stream, userId) => {
    const call = this.peer.call(remoteBrokeringId, stream);
    call.on('stream', (userVideoStream) => {});

    call.on('close', () => {
      // remove stream from new_stream array
    });
  };

  componentWillUnmount() {
    this.setState({remoteStreamUrl: null});
    InCallManager.stop();
    this.peer?.disconnect();
    this.socketConnect.close();
  }

  onPressRemoveUser = (id, index) => {
    this.setState({audioMuteModel: !this.state.audioMuteModel});
    const RoomId = this.props.route.params.roomId;
    this.socketConnect.emit('remove-user', RoomId, id);
    this.socketConnect.on('leave-chat', () => {
      this.socketConnect.disconnect();
      this.socketConnect.close();
      this.setState({remoteStreamUrl: null});
      this.peer.destroy();
      this.props.navigation.goBack();
    });
  };

  onPressModel = (item, index) => {
    if (this.state.roomData?.creator_id === this.props.userData?.id) {
      this.setState({
        audioMuteModel: !this.state.audioMuteModel,
        audioUserItem: item,
        userIndex: index,
      });
    }
  };

  render() {
    const {
      groupData,
      userMute,
      userDetails,
      audioUserItem,
      userIndex,
      muteAll,
      roomData,
    } = this.state;
    const {userData} = this.props;
    const {reportReasonList} = this.props;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          optionHandler={() => this.setState({menu: !this.state.menu})}
          {...this.props}
          title={
            userDetails !== undefined
              ? userDetails?.member_name || userDetails?.first_name
              : groupData?.name
          }
          option={userDetails !== undefined ? false : true}
          color={this.state.menu ? theme.colors.blue : theme.colors.grey10}
        />

        <View style={styles.container}>
          {userDetails === undefined ? (
            <>
              <Icon name="disc" color={theme.colors.blue} size={scale(16)} />
              <Label
                title={roomData?.room_title}
                style={{marginLeft: scale(5), color: theme.colors.black}}
              />
            </>
          ) : null}
        </View>
        <View
          style={[
            styles.aduioCallContainer,
            externalStyle.shadow,
            {marginTop: userDetails !== undefined ? scale(0) : scale(25)},
          ]}>
          {this.state.userList.length === 0 ? (
            <></>
          ) : (
            <FlatList
              contentContainerStyle={{padding: scale(2)}}
              showsVerticalScrollIndicator={false}
              data={this.state.userList}
              extraData={[this.state, this.props]}
              horizontal={false}
              numColumns={3}
              keyExtractor={(item) => {
                return item?.id;
              }}
              renderItem={({item, index}) => {
                return (
                  <View style={styles.cardView}>
                    <View
                      style={[
                        styles.imageCon,
                        {
                          borderColor: !item?.mic
                            ? theme.colors.grey19
                            : theme.colors.blue,
                        },
                      ]}>
                      <TouchableOpacity
                        onPress={() => {
                          this.onPressModel(item, index);
                        }}>
                        <FastImage
                          source={
                            item?.userProfilePic === null
                              ? images.defaultUser
                              : {uri: item?.userProfilePic}
                          }
                          style={styles.image}
                        />
                      </TouchableOpacity>
                      <View style={[styles.micView, externalStyle.shadow]}>
                        <Icon
                          name={item?.audio ? 'mic' : 'mic-off'}
                          color={
                            item?.audio ? theme.colors.blue : theme.colors.red
                          }
                          size={scale(12)}
                        />
                      </View>
                    </View>
                    <Label title={item?.name} style={styles.label} />
                  </View>
                );
              }}
            />
          )}
        </View>
        <View
          style={[
            styles.btnCon,
            {
              marginTop:
                roomData?.creator_id === userData?.id
                  ? scale(0)
                  : isIphoneX()
                  ? scale(30)
                  : scale(30),
            },
          ]}>
          {roomData?.creator_id === userData?.id && (
            <View style={styles.muteButtonView}>
              <TouchableOpacity
                onPress={() => {
                  this.handleAllUserMute();
                }}
                style={styles.muteCircleView}>
                <Icon
                  name={muteAll ? 'mic-off' : 'mic'}
                  color={theme.colors.grey17}
                  size={scale(18)}
                />
              </TouchableOpacity>
              <Label
                title={
                  muteAll
                    ? getLocalText('Chat.unMuteAll')
                    : getLocalText('Chat.muteAll')
                }
                style={{
                  color: theme.colors.grey17,
                  fontSize: scale(12),
                }}
              />
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              this.setState({userMute: !userMute});
              this.handleMute();
            }}
            style={styles.btn1}>
            <Icon
              name={userMute ? 'mic-off' : 'mic'}
              color={theme.colors.grey17}
              size={scale(18)}
            />
          </TouchableOpacity>
          {this.state.closeIcon && (
            <TouchableOpacity
              onPress={() => {
                this.socketConnect.close();
                this.setState({remoteStreamUrl: null});
                this.peer.destroy();
                this.props.navigation.goBack();
              }}
              style={styles.btn}>
              <Icon name="x" color={theme.colors.white} size={scale(18)} />
            </TouchableOpacity>
          )}
        </View>
        <ReportModel
          isVisible={this.state.reportModel}
          toggleReportmodel={this.closeReport}
          data={this.state.groupData}
          reportGroup={true}
        />
        <ReportModel
          isVisible={this.state.blockModel}
          toggleReportmodel={this.closeBlock}
          data={this.state.groupData}
          blockGroup={true}
        />
        <ReportDetailsModel
          show={this.state.reportDetails}
          closeModal={this.closeReportDetails}
          reasonList={reportReasonList}
          reportType={BLOCKTYPES.REPORT_GROUP}
          postData={true}
        />
        <ReportDetailsModel
          show={this.state.blockDetailsModel}
          closeModal={this.closeBlockDetails}
          reasonList={reportReasonList}
          reportType={BLOCKTYPES.REPORT_GROUP}
          postData={true}
          blockGroup={true}
        />
        <PostponedModel
          isVisible={this.state.postPone}
          close={this.closePostpone}
        />
        <PostponedModel
          isVisible={this.state.postPoneBlock}
          close={this.closePostponeBlock}
          isBlock={true}
        />
        <Menus
          isMenu={this.state.menu}
          menuData={this.state.options}
          handleMenu={this.handleOptions}
        />
        <AudioModel
          show={this.state.audioMuteModel}
          closeModal={() => {
            this.setState({
              audioMuteModel: !this.state.audioMuteModel,
            });
          }}
          onPressMuteUser={this.onPressMuteUser}
          onPressRemoveUser={this.onPressRemoveUser}
          data={audioUserItem}
          index={userIndex}
        />
        <Loader loading={this.state.loadding} />
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
  container: {
    flexDirection: 'row',
    marginTop: scale(20),
    marginHorizontal: scale(20),
    alignItems: 'center',
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.25),
    left: -(theme.SCREENHEIGHT * 0.45),
    transform: [{rotate: '75deg'}],
  },
  aduioCallContainer: {
    padding: scale(10),
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    height: theme.SCREENHEIGHT * 0.64,
    marginHorizontal: scale(15),
    marginTop: scale(25),
    borderRadius: scale(10),
  },
  btnCon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardView: {
    paddingVertical: scale(3),
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 2,
    left: scale(-3),
  },
  imageCon: {
    borderColor: theme.colors.blue,
    borderWidth: scale(1.5),
    borderRadius: scale(25),
  },
  image: {
    width: scale(50),
    height: scale(50),
    borderRadius: scale(25),
  },
  micView: {
    width: scale(22),
    height: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: scale(11),
    backgroundColor: theme.colors.white,
    bottom: -scale(5),
    right: -scale(5),
  },
  btn1: {
    backgroundColor: theme.colors.transparent,
    height: scale(50),
    width: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.grey17,
    borderWidth: 1,
    borderRadius: scale(30),
    marginRight: scale(20),
  },
  btn: {
    backgroundColor: theme.colors.red1,
    height: scale(50),
    width: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(30),
  },
  label: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(11),
    marginTop: scale(3),
  },
  userImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
  },
  userName: {
    fontSize: scale(18),
    color: theme.colors.black,
  },
  muteButtonView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(20),
    width: scale(75),
  },
  muteCircleView: {
    backgroundColor: theme.colors.transparent,
    height: scale(50),
    width: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: theme.colors.grey17,
    borderWidth: 1,
    borderRadius: scale(30),
  },
});

const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  const reportGroupPayload = state.groupsReducer.reportGroupPayload;
  const reportReasonList = state.PostReducer.reportReasonList;
  return {userData, reportGroupPayload, reportReasonList};
};
export default connect(mapStateToProps, {
  reportGroup,
  suspendRoomNotication,
})(AudioCall);
