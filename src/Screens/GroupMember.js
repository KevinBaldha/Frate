import React, {Component} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import {
  Label,
  ScreenContainer,
  HeaderView,
  GroupImages,
  Links,
  DocumentsFile,
  Medias,
  ReportModel,
  ReportDetailsModel,
  PostponedModel,
  FullMediaModel,
  GroupOptions,
  Loader,
  Menus,
  ConfirmationModel,
} from '../Components';
import {theme, scale, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {
  API,
  baseUrl_chat,
  deleteAPICall,
  getAPICall,
  postAPICall,
} from '../Utils/appApi';
import {BLOCKTYPES, SCREEN_TYPE} from '../Utils/StaticData';
import {
  reportGroup,
  manageNotification,
  blockAction,
  CreatedGroupCount,
} from '../Redux/Actions';
let loadMembersData = false;
class MyListImages extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    const sectionWidth = (theme.SCREENWIDTH * 0.9 - 2 * 20) / 3;

    return (
      <TouchableOpacity
        style={styles.itemButton}
        onPress={() => this.props?.getItem(this.props?.item)}>
        <View
          style={{
            width: sectionWidth,
          }}>
          {/* {this.props?.item === undefined ? ( */}
          <Medias item={this.props?.item} />
          {/* ) : null} */}
        </View>
      </TouchableOpacity>
    );
  }
}

class GroupMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSwitchOn: false,
      options: [
        {title: 'GroupInfo.stopnotification', icon: 'bell', status: false},
        {title: 'Report.reporttxt', icon: 'alert-triangle'},
        {title: 'GroupInfo.leavegroup', icon: 'log-out'},
      ],
      groupUserList: this.props?.route?.params?.userLists,
      totalPage: 1,
      currentPage: 1,
      mediaItems: [
        {title: getLocalText('GroupInfo.info')},
        {title: getLocalText('GroupInfo.mediabtn')},
        {title: getLocalText('GroupInfo.doc')},
        {title: getLocalText('GroupInfo.link')},
      ],
      menuSelected: '1',
      selectedTab: 0,
      reportModel: false,
      reportDetails: false,
      postPone: false,
      fullScreenMedia: false,
      mediaData: [],
      groupsDetails: this.props?.route?.params?.groupData,
      loadmoreMembers: false,
      userOptions: false,
      selectedUser: '',
      loadding: false,
      userdetails: '',
      showOptions: false,
      mediaDatas: '',
      docsDatas: '',
      linksDatas: '',
      deleteModel: false,
      joined: false,
      menuData: [
        {
          icon: 'bell-off',
          name: getLocalText('GroupInfo.stopnotification'),
        },
        {icon: 'user-check', name: getLocalText('GroupInfo.join')},
        {icon: 'alert-circle', name: getLocalText('GroupInfo.report')},
        {icon: 'edit', name: getLocalText('GroupInfo.edit')},
        {icon: 'delete-outline', name: getLocalText('GroupInfo.delete')},
      ],
      singleChatId: this?.props?.route?.params?.singleChatId,
      recieverData: this?.props?.route?.params?.recieveId,
    };
  }
  componentDidMount() {
    this.refreshMembers();
    this.getGroupDetails();
    this.getGroupMedia();
    this.getGroupLinks();
    this.getGroupDocs();
  }

  //get group details
  getGroupDetails = async () => {
    let groupId = this.props?.route?.params?.groupData?.id;
    try {
      let response = await getAPICall(API.groupCreate + '/' + groupId);
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            groupsDetails: data,
            joined: data?.joined,
          });
        }
        this.setState({data: response.data});
      }
    } catch (error) {}
  };

  //medias
  getGroupMedia = async () => {
    let groupId = this.props?.route?.params?.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type', 'media');
      let response = await postAPICall(API.groupMedia, frmdata);

      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            mediaDatas: data,
            // userImage: {uri: data.image, mediaType: 'image'},
            // joined: data?.joined,
          });
        }
        this.setState({data: response.data});
      }
    } catch (error) {}
  };

  // links lists
  getGroupLinks = async () => {
    let groupId = this.props?.route?.params?.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type', 'link');
      let response = await postAPICall(API.groupMedia, frmdata);
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            linksDatas: data,
            // userImage: {uri: data.image, mediaType: 'image'},
            // joined: data?.joined,
          });
        }
        this.setState({data: response.data});
      }
    } catch (error) {}
  };

  //docs files
  getGroupDocs = async () => {
    let groupId = this.props?.route?.params?.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type', 'document');
      let response = await postAPICall(API.groupMedia, frmdata);
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            docsDatas: data,
            // userImage: {uri: data.image, mediaType: 'image'},
            // joined: data?.joined,
          });
        }
        this.setState({data: response.data});
      }
    } catch (error) {}
  };

  onPressProfile = async (item, index) => {
    this.redirectToUserDetails(item, item?.member_id);
  };
  redirectToUserDetails = async (item, userId) => {
    this.props.navigation.navigate('UserDataSpecific', {
      data: item?.member_id === undefined ? item : item?.member_id,
      id: userId,
      screenName: SCREEN_TYPE.NEW_USER,
      type: '2',
    });
  };

  //group members
  renderPeoples = ({item, index}) => {
    // let colors =
    //   item?.gradient_color.length !== 0
    //     ? item?.gradient_color
    //     : ['#2a2a72', '#3eadcf', '#2a2a72', '#009ffd'];
    return (
      <View style={[styles.userView, {marginBottom: scale(10)}]} key={index}>
        <TouchableOpacity
          style={styles.userView}
          disabled={item?.is_reported}
          onPress={() => {
            this.onPressProfile(item);
          }}>
          <View style={styles.gradientsp}>
            <FastImage
              source={
                item?.member_image.length !== 0
                  ? {uri: item?.member_image?.original}
                  : images.profilepick
              }
              style={styles.userPic}
            />
          </View>
          <Label
            title={`${item?.member_name} ${
              item?.is_reported ? ' - Reported' : ''
            }`}
            style={[
              styles.memberNameContainer,
              {
                color: item?.is_reported
                  ? theme.colors.grey
                  : theme.colors.black,
              },
            ]}
          />
        </TouchableOpacity>

        <View style={styles.optionView}>
          <Label title={item?.role} style={styles.role} />
          {item?.member_id !== this.props.userData.id && !item?.is_reported && (
            <TouchableOpacity
              onPress={() => {
                this.handleUser(item);
                this.setState({userdetails: item});
              }}>
              <Icon
                name="more-vertical"
                size={scale(19)}
                color={theme.colors.blue}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  handleUser = (userData) => {
    this.setState({
      userOptions: !this.state.userOptions,
      selectedUser: userData,
    });
  };

  closeGroupOptions = async (item) => {
    this.setState({
      userOptions: !this.state.userOptions,
    });
    if (item?.id === 0) {
      this.props.navigation.navigate('UserDataSpecific', {
        data: this.state.selectedUser.member_id,
        id: this.state.selectedUser?.member_id,
        screenName: SCREEN_TYPE.NEW_USER,
        type: '2',
        // userSpefific: true,
      });
    } else if (item?.id === 2) {
      setTimeout(() => {
        this.setState({reportModel: true});
      }, 500);
    } else if (item?.id === -1) {
      try {
        let makeAdmin = new FormData();
        makeAdmin.append('group_id', this.state.groupsDetails?.id);
        makeAdmin.append('user_id', this.state.selectedUser.member_id);
        let response = await postAPICall(API.makeAdmin, makeAdmin);
        if (response.success) {
          Alert.alert(response.message);
          this.props.navigate.navigate('UserData');
          this.refreshMembers();
        } else {
          if (response.error) {
            Alert.alert(response.errorMsg);
          } else {
            Alert.alert(response.message);
          }
        }
      } catch (error) {}
    } else if (item?.id === 4) {
      let chatResponse = await getAPICall(
        API.chat + this.state.selectedUser.member_id,
      );
      this.props.navigation.push('Chat', {
        data: chatResponse?.data,
        singleChat: '1',
      });
    } else if (item?.id === 3) {
      let removeUser = new FormData();
      removeUser.append('group_id', this.state.groupsDetails?.id);
      removeUser.append('user_id', this.state.selectedUser.member_id);

      let response = await postAPICall(API.removeUserFromGroup, removeUser);

      if (response.success) {
        Alert.alert(response.message);
        // this.props.navigate.navigate('UserData');
        this.refreshMembers();
      } else {
        if (response.error) {
          Alert.alert(response.errorMsg);
        } else {
          Alert.alert(response.message);
        }
      }
    }
  };

  renderLinks = ({item, index}) => {
    return <Links item={item} index={index} />;
  };

  renderDoc = ({item, index}) => {
    return <DocumentsFile item={item} index={index} />;
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
  closeReportDetails = (details, reason) => {
    if (details === undefined || reason === undefined) {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
    } else {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
      let blockUser = new FormData();
      blockUser.append('group_id', this.state.groupsDetails.id);
      blockUser.append('blocked_user_id', this.state.selectedUser.member_id); //user id send karvanu thase
      blockUser.append('type', BLOCKTYPES.REPORT_USER);
      blockUser.append('details', details);
      blockUser.append('reason', reason);

      this.props.blockAction(0, blockUser);

      setTimeout(() => {
        this.setState({
          postPone: !this.state.postPone,
        });
      }, 700);
    }
  };
  closePostpone = () => {
    this.setState({postPone: false});
  };

  handleClose = () => {
    this.setState({fullScreenMedia: false});
  };
  _renderSectionListItem = ({item}) => {
    return (
      <FlatList
        data={item}
        numColumns={3}
        extraData={this.state}
        renderItem={this._renderItem}
        keyExtractor={this._keyExtractor}
      />
    );
  };

  getItem = (item) => {
    this.setState({
      mediaData: {
        uri: baseUrl_chat + item?.attachment,
        mediaType: item?.type?.toLowerCase(),
      },
    });
    setTimeout(() => {
      this.setState({fullScreenMedia: true});
    }, 500);
  };

  _renderItem = ({item}) => (
    <MyListImages
      id={item?.id}
      image={item?.image}
      item={item}
      getItem={this.getItem}
    />
  );

  renderDocument = ({item}) => (
    <FlatList
      keyExtractor={(_, index) => index.toString()}
      data={item}
      extraData={this.state}
      renderItem={this.renderDoc}
      style={{
        paddingHorizontal: scale(13),
        marginVertical: scale(10),
      }}
      numColumns={1}
    />
  );

  renderLinksData = ({item}) => {
    return (
      <FlatList
        data={item}
        extraData={this.state}
        keyExtractor={(_, index) => index.toString()}
        renderItem={this.renderLinks}
        showsVerticalScrollIndicator={false}
        style={{
          paddingHorizontal: scale(13),
          paddingVertical: scale(10),
        }}
        numColumns={1}
        nestedScrollEnabled={true}
      />
    );
  };

  _renderSectionHeader = ({section}) => (
    <Label title={section.title.toUpperCase()} style={styles.titletxt} />
  );

  //load more members of group
  renderFooterMembers = () => {
    if (!this.state.loadmoreMembers) {
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
  refreshMembers = async () => {
    this.setState({
      isSwitchOn: this.props?.route?.params?.groupData?.is_notification,
    });
    let group_id = this.state.groupsDetails.id;
    this.setState({loadding: true});
    let membersRes = await getAPICall(
      API.groupMembers + group_id + '?page=' + this.state.currentPage,
    );
    if (membersRes.success) {
      this.setState({
        groupUserList: membersRes.data,
        totalPage: membersRes.total_page,
        loadding: false,
      });
    } else {
      this.setState({
        groupUserList: [],
        totalPage: 0,
        loadding: false,
      });
    }
  };

  //load more users
  loadMore = async () => {
    let group_id = this.state.groupsDetails.id;
    if (this.state.groupUserList) {
      if (this.state.currentPage <= this.state.totalPage && !loadMembersData) {
        let page = this.state.currentPage + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmoreMembers: true});
          loadMembersData = true;
          let membersRes = await getAPICall(
            API.groupMembers + group_id + '?page=' + page,
          );
          let data = [...this.state.groupUserList, ...membersRes.data];
          if (membersRes.success) {
            this.setState({
              groupUserList: data,
              loadmoreMembers: false,
              currentPage: page,
            });
            loadMembersData = false;
          }
        }
      } else {
        this.setState({loadmoreMembers: false});
      }
    }
  };
  //handle NOtification
  handleNotication = async (item) => {
    try {
      this.setState({loadding: true});
      await this.props.manageNotification(this.state.groupsDetails?.id);
      if (this.props.notification) {
        this.setState({loadding: false});
        this.setState({isSwitchOn: item});
      } else {
        this.setState({loadding: false});
        Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
      }
    } catch (error) {}
  };
  handleOptions = () => {
    this.setState({showOptions: !this.state.showOptions});
  };

  //handle menu
  handleMenu = (menuItem) => {
    this.setState({showOptions: !this.state.showOptions});
    let group_id = this.state.groupsDetails?.id;
    if (this.props.userData.id !== this.state.groupsDetails.created_by) {
      Alert.alert(getLocalText('ErrorMsgs.groupsetup'));
    } else {
      if (menuItem === 0) {
        this.props.manageNotification(group_id);
      } else if (menuItem === 1) {
        this.props.navigation.navigate('RequrestJoinGroup', {
          data: this.state.groupsDetails,
        });
      } else if (menuItem === 2) {
        this.props.navigation.navigate('ReportedContent', {
          data: this.state.groupsDetails,
        });
      } else if (menuItem === 3) {
        this.props.navigation.navigate('CreateGroup', {
          data: this.state.groupsDetails,
        });
      } else if (menuItem === 4) {
        setTimeout(() => {
          this.setState({deleteModel: true});
        }, 400);
      }
    }
  };

  deleteGroup = async (data) => {
    this.setState({deleteModel: false});
    if (data === 1) {
      let groupId = this.state.groupsDetails.id;
      try {
        let deleteGroup = await deleteAPICall(API.groupCreate + '/' + groupId);
        if (deleteGroup.success) {
          this.props.CreatedGroupCount(this.props.created_g_count - 1);
          this.props.navigation.navigate('Timeline');
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
      groupUserList,
      menuSelected,
      selectedTab,
      groupsDetails,
      singleChatId,
      recieverData,
    } = this.state;

    const {reportReasonList} = this.props;
    return (
      <ScreenContainer>
        <HeaderView
          title={
            singleChatId !== '1'
              ? groupsDetails?.name
              : recieverData?.first_name
          }
          titleStyleMain={singleChatId === '1' ? styles.headerContainer : {}}
          {...this.props}
          subHeader={
            singleChatId !== '1' && (
              <GroupImages
                groupImagesView={{marginLeft: scale(55), top: scale(-5)}}
                members={groupsDetails}
              />
            )
          }
          option={
            this.props?.userData?.id !== this.state.groupsDetails?.created_by
              ? false
              : true
          }
          optionHandler={this.handleOptions}
          navigateScreen={() => {}}
        />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {selectedTab === 0 ? (
            <View>
              {singleChatId !== '1' && (
                <>
                  <Label
                    title={`${groupsDetails?.total_members}  ${
                      groupsDetails?.total_members > 1
                        ? getLocalText('GroupInfo.member')
                        : getLocalText('GroupInfo.singleMember')
                    }`}
                    style={styles.members}
                  />
                  {!groupUserList ? (
                    <Loader loading={this.state.loadding} />
                  ) : (
                    <FlatList
                      scrollEnabled={false}
                      data={groupUserList === undefined ? '' : groupUserList}
                      extraData={this.state}
                      keyExtractor={(_, index) => index.toString()}
                      renderItem={this.renderPeoples}
                      contentContainerStyle={{
                        paddingHorizontal: scale(23),
                        paddingBottom: scale(10),
                      }}
                      // style={{height: theme.SCREENHEIGHT * 0.45}}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      ListFooterComponent={this.renderFooterMembers.bind(this)}
                      onEndReachedThreshold={0.2}
                      onEndReached={this.loadMore}
                    />
                  )}
                </>
              )}
            </View>
          ) : menuSelected === '2' ? (
            this.props.navigation.navigate('Tabs')
          ) : menuSelected === '1' ||
            menuSelected === '2' ||
            menuSelected === '0' ? (
            <View>
              {selectedTab === 3 ? (
                <>
                  {this.state.linksDatas[0]?.data.length > 0 ||
                  this.state.linksDatas[1]?.data.length > 0 ||
                  this.state.linksDatas[2]?.data.length > 0 ||
                  this.state.linksDatas[3]?.data.length > 0 ? (
                    <View style={styles.nodataComponent}>
                      <Label title={getLocalText('Groups.nolink')} />
                    </View>
                  ) : (
                    <SectionList
                      sections={this.state.linksDatas}
                      key={'_'}
                      keyExtractor={(item) => '_' + item?.id}
                      renderItem={this.renderLinksData}
                      renderSectionHeader={this._renderSectionHeader}
                      style={{
                        height: theme.SCREENHEIGHT * 0.45,
                      }}
                      contentContainerStyle={{paddingBottom: scale(20)}}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </>
              ) : selectedTab === 2 ? (
                <>
                  {this.state.docsDatas[0]?.data.length > 0 ||
                  this.state.docsDatas[1]?.data.length > 0 ||
                  this.state.docsDatas[2]?.data.length > 0 ||
                  this.state.docsDatas[3]?.data.length > 0 ? (
                    <View style={styles.nodataComponent}>
                      <Label title={getLocalText('Groups.noDoc')} />
                    </View>
                  ) : (
                    <SectionList
                      sections={this.state.docsDatas}
                      key={'*'}
                      keyExtractor={(item) => '*' + item?.id}
                      renderItem={this.renderDocument}
                      renderSectionHeader={this._renderSectionHeader}
                      style={{height: theme.SCREENHEIGHT * 0.45}}
                      contentContainerStyle={{paddingBottom: scale(20)}}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </>
              ) : (
                <>
                  {this.state.mediaDatas[0]?.data.length > 0 ||
                  this.state.mediaDatas[1]?.data.length > 0 ||
                  this.state.mediaDatas[2]?.data.length > 0 ||
                  this.state.mediaDatas[3]?.data.length > 0 ? (
                    <View style={styles.nodataComponent}>
                      <Label title={getLocalText('Groups.nomedia')} />
                    </View>
                  ) : (
                    <SectionList
                      key={'#'}
                      keyExtractor={(item) => '#' + item?.id}
                      renderItem={this._renderSectionListItem}
                      renderSectionHeader={this._renderSectionHeader}
                      numColumns={3}
                      columnWrapperStyle={styles.sectionCol}
                      style={{height: theme.SCREENHEIGHT * 0.45}}
                      contentContainerStyle={{paddingBottom: scale(20)}}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    />
                  )}
                </>
              )}
            </View>
          ) : null}
        </ScrollView>
        <FullMediaModel
          isShow={this.state.fullScreenMedia}
          closeModel={this.handleClose}
          postImages={this.state.mediaData}
        />

        <ReportModel
          isVisible={this.state.reportModel}
          toggleReportmodel={this.closeReport}
          data={this.state.selectedUser}
          reportGroup={false}
          reportPerson={true}
          userdetails={this.state.userdetails}
        />
        <ReportDetailsModel
          show={this.state.reportDetails}
          closeModal={this.closeReportDetails}
          reasonList={reportReasonList}
        />
        <PostponedModel
          isVisible={this.state.postPone}
          close={this.closePostpone}
          postData={true}
        />
        <GroupOptions
          isShow={this.state.userOptions}
          handleClose={this.closeGroupOptions}
          adminId={this.props?.route?.params?.groupData?.group_admin_id}
          loginUserId={this.props.userData.id}
        />
        <Loader loading={this.state.loadding} />
        <Menus
          isMenu={this.state.showOptions}
          menuData={this.state.menuData}
          handleMenu={this.handleMenu}
          menuMainContainer={{
            marginTop: -scale(5),
          }}
        />
        <ConfirmationModel
          isVisible={this.state.deleteModel}
          close={this.deleteGroup}
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  itemButton: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
    alignItems: 'center',
    left: scale(7),
  },
  sectionCol: {
    borderWidth: 3,
    borderColor: theme.colors.white1,
  },
  columnWrapperStyle: {
    flexWrap: 'wrap',
    flex: 1,
    marginTop: 5,
  },
  image: {width: '100%', height: scale(200), resizeMode: 'stretch'},
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {width: '100%'},
  headerContainer: {width: '85%'},
  role: {
    paddingHorizontal: scale(5),
    color: theme.colors.grey10,
    fontSize: scale(12),
  },
  optionView: {
    right: 0,
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
  },
  memberNameContainer: {
    marginLeft: scale(13),
    flex: 1,
  },
  userPic: {
    height: scale(50),
    width: scale(50),
    resizeMode: 'cover',
    borderRadius: scale(25),
  },
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  titletxt: {
    color: theme.colors.grey10,
    left: scale(10),
  },
  title: {
    left: scale(5),
    color: theme.colors.white,
    fontFamily: theme.fonts.muktaBold,
    fontSize: scale(14),
  },
  members: {
    color: theme.colors.black,
    marginBottom: scale(5),
    marginLeft: scale(20),
  },
  gradientsp: {
    padding: 2,
    backgroundColor: theme.colors.white,
    borderRadius: scale(25),
  },
  nodataComponent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.SCREENHEIGHT / 2.5,
  },
});

const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  const notification = state.groupsReducer.groupNotication;
  const created_g_count = state.UserInfo.creaetedGroupCount;
  const reportReasonList = state.PostReducer.reportReasonList;
  return {userData, notification, created_g_count, reportReasonList};
};
export default connect(mapStateToProps, {
  reportGroup,
  manageNotification,
  CreatedGroupCount,
  blockAction,
})(GroupMember);
