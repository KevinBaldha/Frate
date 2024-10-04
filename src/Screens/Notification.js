import moment from 'moment';
import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import Pressable from 'react-native/Libraries/Components/Pressable/Pressable';
import {connect} from 'react-redux';
import {Button, HeaderView, BackgroundChunk, Label} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {scale, theme, images, Config} from '../Utils';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import {getWeekDay} from '../Utils/helper';
import {
  notificationResponse,
  notificationTypes,
  SCREEN_TYPE,
} from '../Utils/StaticData';
import {setNotificationBellIcon, getGroupRoom} from '../Redux/Actions';
import FastImage from 'react-native-fast-image';

class Notifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      page: 1,
      totalPage: 1,
      loading: false,
      isItemPress: false,
      item: true,
      getGroupPost: [],
    };
  }

  componentDidMount() {
    this.getAllNotifications();
    this.getNotification();
  }

  getGroupApi = async (group_id) => {
    try {
      const response = await getAPICall(API.getSingleGroup + group_id);
      if (response.success) {
        this.setState({
          getGroupPost: response.data,
        });
      } else {
        Alert.alert(response.errorMsg.message);
      }
    } catch (error) {}
  };

  //get all notifications
  getAllNotifications = async () => {
    this.setState({loading: true});
    let userId = this.props?.userDatas?.id;
    try {
      let notification = await getAPICall(
        API.getAllNotifications +
          userId +
          '?limit=' +
          100 +
          '&page=' +
          this.state.page,
      );
      if (notification.success) {
        this.setState({data: notification.data, loading: false});
      } else {
        this.setState({loading: false});
      }
    } catch (error) {
      this.setState({loading: false});
    }
  };

  getNotification = async () => {
    try {
      this.setState({loading: true});
      let success = await getAPICall(API.updateNotificationFlag);
      if (success.error) {
        this.setState({loading: false});
      } else {
        this.setState({loading: false});
        if (success.data.value === 0) {
          this.props.setNotificationBellIcon(false);
        }
      }
    } catch (error) {
      this.setState({loading: false});
    }
  };

  getChatRoomListApi = async (group_id, roomId) => {
    // const groupChat = await this.props.getGroupRoom(page, group_id, lastId);
    await this.getGroupApi(group_id);
    let response = await getAPICall(API.getSingleRoom + roomId);
    const lastGroupChatId = await getAPICall(API.lastGroupChatId + roomId);
    this.props.navigation.navigate('Chat', {
      groupData: this.state.getGroupPost,
      members: response.data,
      newJoin: false,
      roomData: response.data,
      roomId: roomId,
      lastGroupChatId: lastGroupChatId,
    });
  };

  //read notification
  handleRead = async (data) => {
    let Id = data?.id;
    let notificationRead = await getAPICall(API.readNotification + Id);
    if (notificationRead.success) {
      this.getAllNotifications();
    }
  };

  // redirect to 1 to 1 chat
  handleChatNavigation = async (item) => {
    if (
      item?.notification_type === notificationTypes.newMessageInPersonalChatroom
    ) {
      const userID = item?.sender_id;
      let chatResponse = await getAPICall(API.chat + userID);
      this.props.navigation.navigate('Chat', {
        data: chatResponse.data,
        singleChat: '1',
      });
    } else if (item?.notification_type === notificationTypes.postSponsored) {
      this.props.navigation.navigate('ActiveSponsorPost', {
        title: getLocalText('Settings.mySponsor'),
      });
    } else if (item?.notification_type === notificationTypes.postSponsorAlert) {
      this.props.navigation.navigate('Timeline');
    } else if (
      item?.notification_type === notificationTypes.postLiked ||
      item?.notification_type === notificationTypes.sponsorPostLiked ||
      item?.notification_type === notificationTypes.POST_SHARED
    ) {
      await this.getGroupApi(item?.group_id);
      this.props.navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state?.getGroupPost,
          joined: true,
          notification: true,
          redirect_id: item?.redirect_id,
        },
      });
    } else if (
      item?.notification_type === notificationTypes.commentOnPost ||
      item?.notification_type === notificationTypes.commentOnSponsorPost
    ) {
      await this.getGroupApi(item?.group_id);
      this.props.navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state.getGroupPost,
          joined: true,
          notification: true,
          redirect_id: item?.redirect_id,
        },
      });
    } else if (item?.notification_type === notificationTypes.newPost) {
      await this.getGroupApi(item?.group_id);
      this.props.navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state.getGroupPost,
          joined: true,
          notification: true,
          redirect_id: item?.redirect_id,
        },
      });
    } else if (
      item?.notification_type === notificationTypes.groupRequestAccepted
    ) {
      await this.getGroupApi(item?.group_id);
      this.props.navigation.navigate('GroupDetails', {
        item: {
          groupData: this.state.getGroupPost,
          joined: true,
        },
      });
    } else if (
      item?.notification_type ===
        notificationTypes.invitationPrivateConversation ||
      item?.notification_type === notificationTypes.newMessageInChatroom
    ) {
      if (item?.group_id) {
        this.getChatRoomListApi(item?.group_id, item?.redirect_id);
      }
    } else if (
      item?.notification_type ===
        notificationTypes.audioRoomConversationStarted ||
      item?.notification_type === notificationTypes.invitationPrivateAudioRoom
    ) {
      // this.getChatRoomListApi(item?.group_id, item?.redirect_id);
      await this.getGroupApi(item?.group_id);
      await this.props.navigation.navigate('GroupDetails', {
        item: {groupData: this.state.getGroupPost, joined: true, category: 3},
      });
    }

    //  else if (
    //   item?.notification_type === notificationTypes.audioRoomConversationStarted
    // ) {
    //   await this.getGroupApi(item?.group_id);
    //   let response = await getAPICall(API.getSingleRoom + item?.redirect_id);
    //   this.props.navigation.navigate('AudioCall', {
    //     groupData: this.state.getGroupPost,
    //     members: response.data,
    //     newJoin: false,
    //     roomData: response.data,
    //     roomId: item?.redirect_id,
    //   });
    // }
  };

  handleAccept = async (items, index, status) => {
    if (items?.notification_type === notificationResponse.JoinNewRequest) {
      let joinForm = new FormData();
      joinForm.append('group_id', items?.group_id + '');
      joinForm.append('user_id', items?.sender_id + '');
      joinForm.append('status', status);

      try {
        let userRequest = await postAPICall(API.groupJoinRequest, joinForm);
        if (userRequest.error) {
          Alert.alert(userRequest.error);
        } else {
          this.getAllNotifications();
        }
      } catch (error) {}
    } else if (
      items?.notification_type === notificationResponse.FriendRequest
    ) {
      let requestUpdate = new FormData();
      requestUpdate.append('user_id', items?.sender_id + '');
      requestUpdate.append('status', status === '1' ? 'accepted' : 'denied');
      try {
        let userRequest = await postAPICall(
          API.friendrequestUpdate,
          requestUpdate,
        );

        if (userRequest.error) {
        } else {
          this.getAllNotifications();
        }
      } catch (error) {}
    }
  };

  profileNavigation = (items) => {
    if (items?.sender_id) {
      this.props.navigation.navigate('UserDataSpecific', {
        id: items?.sender_id,
        screenName: SCREEN_TYPE.NEW_USER,
      });
    }
  };

  handleRefresh = () => {
    this.getAllNotifications();
    this.getNotification();
  };

  render() {
    const highlight = (string) => (
      <Text style={[styles.highlighted]}>{string}</Text>
    );

    return (
      <View>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          title={getLocalText('Settings.notifications')}
          color={theme.colors.grey10}
          backgroundColor={theme.colors.white1}
          titleStyleMain={styles.header}
        />

        <FlatList
          style={styles.root}
          data={this.state.data}
          extraData={this.state}
          contentContainerStyle={{paddingBottom: scale(150)}}
          keyExtractor={(item) => item?.id.toString()}
          renderItem={({item, index}) => {
            const notification = item;
            return (
              <Pressable
                key={index}
                onPress={() => {
                  this.handleRead(notification);
                  this.handleChatNavigation(notification);
                }}
                style={({pressed}) => [
                  styles.userView,
                  {
                    backgroundColor: pressed
                      ? theme.colors.grey3
                      : theme.colors.white2,
                  },
                ]}>
                <View style={styles.msgContainer}>
                  <View style={styles.row}>
                    <TouchableOpacity
                      onPress={() => {
                        this.profileNavigation(notification);
                      }}>
                      <FastImage
                        source={
                          notification.image?.medium == null ||
                          notification.image?.medium === undefined
                            ? images.profilepick
                            : {uri: notification.image?.medium}
                        }
                        style={styles.avatar}
                      />
                    </TouchableOpacity>

                    <View style={styles.viewName}>
                      <Text style={styles.notification_msg}>
                        <Text
                          style={styles.notification_msg}
                          onPress={() => {
                            this.profileNavigation(item);
                          }}>
                          {highlight(item?.sender_name)}
                        </Text>
                        {' ' + notification.message}
                      </Text>
                    </View>
                  </View>
                  <Label
                    title={
                      getWeekDay(
                        moment(notification.created_at).format('ddd'),
                      ) +
                      ' ' +
                      moment(notification.created_at).format('hh:mm')
                    }
                    style={styles.label}
                  />
                </View>
                {(notification?.notification_type ===
                  notificationResponse.JoinNewRequest ||
                  notification?.notification_type ===
                    notificationResponse.FriendRequest) &&
                notification.is_show_btn === 1 ? (
                  <View style={styles.btnMainContain}>
                    <Button
                      title={getLocalText('Settings.acceptInvite')}
                      style={styles.btnContain}
                      titleStyle={{fontSize: scale(13)}}
                      onPress={() =>
                        this.handleAccept(notification, index, '1')
                      }
                    />
                    <Button
                      title={getLocalText('Settings.refuseInvite')}
                      style={styles.btnContainEmpty}
                      titleStyle={{
                        color: theme.colors.blue,
                        fontSize: scale(13),
                      }}
                      onPress={() =>
                        this.handleAccept(notification, index, '0')
                      }
                    />
                  </View>
                ) : null}
              </Pressable>
            );
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={() => this.handleRefresh()}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.loadingCon}>
              {Config.NO_DATA_COMPO(
                this.state.loading,
                getLocalText('ErrorMsgs.emptyList'),
              )}
            </View>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_container: {
    backgroundColor: theme.colors.white,
    flex: 1,
  },
  header: {
    width: '90%',
  },
  loadingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT * 0.75,
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.45),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '80deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.6),
    left: -(theme.SCREENHEIGHT * 0.5),
    transform: [{rotate: '80deg'}],
  },
  root: {
    paddingVertical: scale(10),
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  highlighted: {
    color: theme.colors.blue,
    textDecorationLine: 'underline',
    left: scale(10),
  },
  notification_msg: {
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.grey7,
    fontSize: scale(12),
    lineHeight: scale(17),
  },
  userView: {
    alignItems: 'center',
    marginBottom: scale(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(10),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    marginHorizontal: scale(10),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: scale(2),
  },
  label: {
    position: 'absolute',
    right: scale(0),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    color: theme.colors.grey10,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    width: theme.SCREENWIDTH * 0.55,
    overflow: 'visible',
    alignItems: 'center',
  },
  viewName: {
    width: '100%',
    marginHorizontal: 15,
  },
  btnMainContain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(10),
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  btnContain: {
    width: '48%',
    marginTop: scale(15),
    height: theme.SCREENHEIGHT * 0.059,
    marginHorizontal: scale(3),
  },
  btnContainEmpty: {
    width: '48%',
    marginTop: scale(15),
    backgroundColor: theme.colors.white,
    height: theme.SCREENHEIGHT * 0.059,
    borderWidth: scale(1),
    borderColor: theme.colors.blue,
    marginHorizontal: scale(3),
  },
});

const mapStateToProps = (state) => {
  const userDatas = state.UserInfo.data;
  return {userDatas};
};
export default connect(mapStateToProps, {
  setNotificationBellIcon,
  getGroupRoom,
})(Notifications);
