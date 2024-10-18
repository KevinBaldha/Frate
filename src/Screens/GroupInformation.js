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
import {Switch} from 'react-native-switch';
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
  Loader,
  Title,
  Menus,
  ConfirmationModel,
} from '../Components';
import {theme, scale, images} from '../Utils';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {API, deleteAPICall, getAPICall, postAPICall} from '../Utils/appApi';
import {BLOCKTYPES} from '../Utils/StaticData';
import {reportGroup, manageNotification} from '../Redux/Actions';

class MyListItem extends React.PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <TouchableOpacity
        style={styles.itemButton}
        onPress={() => this.props.getItem(this.props?.item)}>
        <Medias item={this.props?.item} />
      </TouchableOpacity>
    );
  }
}

class GroupInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSwitchOn: false,
      options: [
        {title: 'GroupInfo.stopnotification', icon: 'bell', status: false},
        {title: 'Report.reporttxt', icon: 'alert-triangle'},
        {title: 'GroupInfo.leavegroup', icon: 'log-out'},

        // {title: 'GroupInfo.media', icon: 'image'},
        // {title: 'GroupInfo.viewgroup', icon: 'copy'},
      ],
      mediaItems: [
        {title: getLocalText('GroupInfo.info')},
        {title: getLocalText('GroupInfo.mediabtn')},
        {title: getLocalText('GroupInfo.doc')},
        {title: getLocalText('GroupInfo.link'), type: 'link'},
      ],
      menuSelected: '1',
      selectedTab: this?.props?.route?.params?.singleChatId === '1' ? 1 : 0,
      reportModel: false,
      reportDetails: false,
      postPone: false,
      fullScreenMedia: false,
      mediaData: '',
      groupsDetails: this.props?.route?.params?.groupData,
      loadMoreMembers: false,
      userOptions: false,
      selectedUser: '',
      loading: false,
      isLoading: false,
      showOptions: false,
      mediaArray: [],
      docsObject: '',
      linksData: '',
      deleteModel: false,
      joined: false,
      menuData: [
        // {
        //   icon: 'bell-off',
        //   name: getLocalText('GroupInfo.stopnotification'),
        // },
        {icon: 'user-check', name: getLocalText('GroupInfo.join')},
        {icon: 'alert-circle', name: getLocalText('GroupInfo.report')},
        {icon: 'edit', name: getLocalText('GroupInfo.edit')},
        {icon: 'delete-outline', name: getLocalText('GroupInfo.delete')},
      ],
      singleChatId: this?.props?.route?.params?.singleChatId,
      recieverData: this?.props?.route?.params?.recieveId,
      privateRoomId: this?.props?.route?.params?.privateRoomId,
      exitGroupModel: false,
    };
  }
  componentDidMount() {
    if (this.state.singleChatId === '1') {
      this.getPrivateChatMedia();
    } else if (this.props.route?.params?.mediaPost === '2') {
      this.setState({mediaItems: this.state.mediaItems.filter(d => !d.type)});
      this.getGroupDetails();
      this.getPostMediaList();
      this.getPostDocList();
    } else {
      this.getGroupDetails();
      this.getGroupMedia();
      this.getGroupLinks();
      this.getGroupDocs();
    }
  }

  //get group details
  getGroupDetails = async () => {
    let groupId =
      this.props?.route?.params?.groupData?.group_id ||
      this.props?.route?.params.groupData?.id;
    try {
      let response = await getAPICall(API.groupCreate + '/' + groupId);
      if (response.success) {
        let data = response.data;
        this.setState({
          groupsDetails: data,
          joined: data?.joined,
          isSwitchOn: response?.data?.is_notification,
        });
      }
    } catch (error) {}
  };

  //medias
  getGroupMedia = async () => {
    this.setState({isLoading: true});
    let groupId =
      this.props?.route?.params?.groupData?.group_id ||
      this.props?.route?.params.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type', 'media');
      let response = await postAPICall(API.groupMedia, frmdata);
      if (response.success) {
        let data = response.data;
        this.setState({
          mediaArray: data,
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({isLoading: false});
    }
  };

  //getPostMediaList
  getPostMediaList = async () => {
    this.setState({isLoading: true});
    let groupId =
      this.props?.route?.params?.groupData?.group_id ||
      this.props?.route?.params.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type[]', 'image');
      frmdata.append('type[]', 'video');
      let response = await postAPICall(API.postGroupMedia, frmdata);

      if (response.success) {
        let data = response.data;
        this.setState({
          mediaArray: data,
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({isLoading: false});
    }
  };

  // get single chat media list
  getPrivateChatMedia = async () => {
    this.setState({isLoading: true});
    try {
      let frmdata = new FormData();
      frmdata.append('chat_id', this.state.privateRoomId);
      frmdata.append('type', 'media');
      let response = await postAPICall(API.privateChatMedia, frmdata);
      if (!response.error) {
        if (response.success) {
          let data = response.data;

          this.setState({
            mediaArray: data,
            isLoading: false,
          });
        }
      }
    } catch (error) {
      this.setState({isLoading: false});
    }
  };

  //getPostDocList
  getPostDocList = async () => {
    this.setState({isLoading: true});
    let groupId =
      this.props?.route?.params?.groupData?.group_id ||
      this.props?.route?.params.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type[]', 'document');
      let response = await postAPICall(API.postGroupMedia, frmdata);
      if (response.error) {
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            docsObject: data,
            isLoading: false,
          });
        }
        // this.setState({data: response.data});
      }
    } catch (error) {
      this.setState({isLoading: false});
    }
  };

  // links lists
  getGroupLinks = async () => {
    this.setState({isLoading: true});
    let groupId =
      this.props?.route?.params?.groupData?.group_id ||
      this.props?.route?.params.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type', 'link');
      let response = await postAPICall(API.groupMedia, frmdata);
      // if (response.error) {
      // } else {
      // }
      if (response.success) {
        let data = response.data;

        this.setState({
          linksData: data,
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({isLoading: false});
    }
  };

  //docs files
  getGroupDocs = async () => {
    this.setState({isLoading: true});
    let groupId =
      this.props?.route?.params?.groupData?.group_id ||
      this.props?.route?.params.groupData?.id;
    try {
      let frmdata = new FormData();
      frmdata.append('group_id', groupId);
      frmdata.append('type', 'document');
      let response = await postAPICall(API.groupMedia, frmdata);
      // if (response.error) {
      // } else {
      // }
      if (response.success) {
        let data = response.data;
        this.setState({
          docsObject: data,
          isLoading: false,
        });
      }
    } catch (error) {
      this.setState({isLoading: false});
    }
  };

  handleMenus = index => {
    this.setState({menuSelected: index});
    if (index === 1) {
      this.setState({reportModel: true});
    } else if (index === 2) {
      this.setState({exitGroupModel: true});
    }
  };

  exitGroupAction = async action => {
    this.setState({exitGroupModel: false});
    if (action === 1) {
      let groupId = this.props.route.params.item?.groupData.id;
      this.props.exitGroup(groupId);
      this.props.navigation.goBack();
      // this.handleRefresh();
    }
  };

  handleTab = index => {
    this.setState({selectedTab: index}, () => {});
  };

  renderLinks = ({item, index}) => {
    return <Links item={item} index={index} />;
  };

  renderDoc = ({item, index}) => {
    return <DocumentsFile item={item} index={index} />;
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
    if (details === undefined || reason === undefined) {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
    } else {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
      let reportGroupForm = new FormData();
      reportGroupForm.append('group_id', this.state.groupsDetails.id);
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
        keyExtractor={(_, index) => index.toString()}
      />
    );
  };

  getItem = item => {
    this.setState({
      mediaData: {
        uri:
          this.state.singleChatId === '1'
            ? item?.attachment
            : item?.uri?.optimize,
        mediaType:
          this.state.singleChatId === '1'
            ? item?.message_type
            : item?.media_type,
      },
    });
    setTimeout(() => {
      this.setState({fullScreenMedia: true});
    }, 500);
  };

  _renderItem = ({item, index}) => {
    return (
      <MyListItem
        key={index}
        id={item?.id}
        image={item?.attachment}
        item={item}
        getItem={this.getItem}
      />
    );
  };

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
        // ListEmptyComponent={() => {
        //   return (
        //     <View style={styles.nodataComponent}>
        //       <Label title={getLocalText('Groups.nolink')} />
        //     </View>
        //   );
        // }}
        numColumns={1}
        nestedScrollEnabled={true}
      />
    );
  };

  _renderSectionHeader = ({section}) => (
    <Label title={section.title.toUpperCase()} style={styles.titleText} />
  );

  //load more members of group
  renderFooterMembers = () => {
    if (!this.state.loadMoreMembers) {
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

  //handle NOtification
  handleNotification = async item => {
    try {
      this.setState({loading: true});
      await this.props.manageNotification(this.state.groupsDetails?.id);
      if (this.props.notification) {
        this.setState({loading: false});
        this.setState({isSwitchOn: item});
      } else {
        this.setState({loading: false});
        Alert.alert(getLocalText('ErrorMsgs.Unable_to_Reach'));
      }
    } catch (error) {}
  };
  handleOptions = () => {
    this.setState({showOptions: !this.state.showOptions});
  };

  //handle menu
  handleMenu = menuItem => {
    this.setState({showOptions: !this.state.showOptions});
    if (this.props.userData.id !== this.state.groupsDetails.created_by) {
      Alert.alert(getLocalText('ErrorMsgs.groupsetup'));
    } else {
      if (menuItem === 0) {
        this.props.navigation.navigate('RequrestJoinGroup', {
          data: this.state.groupsDetails,
        });
      } else if (menuItem === 1) {
        this.props.navigation.navigate('ReportedContent', {
          data: this.state.groupsDetails,
        });
      } else if (menuItem === 2) {
        this.props.navigation.navigate('CreateGroup', {
          data: this.state.groupsDetails,
        });
      } else if (menuItem === 3) {
        setTimeout(() => {
          this.setState({deleteModel: true});
        }, 400);
      }
    }
  };

  deleteGroup = async data => {
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
      options,
      menuSelected,
      mediaItems,
      selectedTab,
      isSwitchOn,
      groupsDetails,
      joined,
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
          titleStyleMain={singleChatId === '1' ? styles.width85 : {}}
          {...this.props}
          subHeader={
            singleChatId !== '1' && (
              <GroupImages
                groupImagesView={{marginLeft: scale(45), top: scale(-5)}}
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
        />

        {this.state.isLoading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.blue}
            style={styles.loader}
          />
        ) : (
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}>
            {singleChatId !== '1' && (
              <FastImage
                source={
                  this.state.groupsDetails?.image?.original === null ||
                  this.state.groupsDetails?.image?.original === undefined
                    ? images.no_image
                    : {
                        uri: this.state.groupsDetails?.image?.large,
                      }
                }
                style={styles.image}
              />
            )}

            {/* {title: 'Report.reporttxt', icon: 'alert-triangle'}, */}
            {!joined
              ? singleChatId !== '1' && (
                  <View>
                    <TouchableOpacity
                      onPress={() => this.handleMenus(1)}
                      style={styles.container}>
                      <Icon
                        name={'alert-triangle'}
                        size={scale(20)}
                        color={theme.colors.grey10}
                      />
                      <Label
                        title={getLocalText('Report.reporttxt')}
                        style={{marginLeft: scale(10)}}
                      />
                    </TouchableOpacity>
                  </View>
                )
              : options.map((item, index) => {
                  return index === 1 &&
                    this.props.userData.id ===
                      this.props?.route?.params?.groupData?.group_admin_id ? (
                    <View />
                  ) : (
                    <View key={index}>
                      <TouchableOpacity
                        key={index.toString()}
                        onPress={() => this.handleMenus(index)}
                        style={styles.container}>
                        <Icon
                          name={item?.icon}
                          size={scale(20)}
                          color={theme.colors.grey10}
                        />
                        <Label
                          title={getLocalText(item?.title)}
                          style={{marginLeft: scale(10)}}
                        />
                        {index === 0 ? (
                          <View style={styles.switchContainer}>
                            <Switch
                              value={isSwitchOn}
                              onValueChange={items =>
                                this.handleNotification(items)
                              }
                              useNativeDriver={true}
                              circleBorderWidth={2}
                              renderActiveText={false}
                              renderInActiveText={false}
                              circleSize={scale(10)}
                              barHeight={scale(21)}
                              innerCircleStyle={{
                                borderColor: isSwitchOn
                                  ? theme.colors.blue
                                  : theme.colors.grey10,
                                backgroundColor: isSwitchOn
                                  ? theme.colors.blue
                                  : theme.colors.transparent,
                              }}
                              containerStyle={styles.switchView}
                              outerCircleStyle={{
                                marginLeft: scale(-1),
                              }}
                              backgroundActive={theme.colors.white2}
                              backgroundInactive={theme.colors.white2}
                              switchBorderRadius={scale(10)}
                              switchWidthMultiplier={3}
                            />
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    </View>
                  );
                })}
            {singleChatId !== '1' && <View style={styles.divider} />}
            <View
              style={[
                singleChatId !== '1' ? styles.tabView : styles.tabViewUpdate,
              ]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingEnd: scale(160),
                  paddingBottom: scale(5),
                }}>
                {mediaItems.map((data, index) => {
                  return singleChatId === '1' && index === 0 ? (
                    <View />
                  ) : (
                    <TouchableOpacity
                      key={index.toString()}
                      onPress={() => this.handleTab(index)}
                      style={[
                        styles.filterBtn,
                        externalStyle.shadow,
                        {
                          backgroundColor:
                            index === this.state.selectedTab
                              ? theme.colors.white
                              : theme.colors.grey14,
                        },
                      ]}>
                      <Label
                        title={data.title}
                        style={{color: theme.colors.blue}}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            {singleChatId !== '1' && selectedTab === 0 ? (
              <View>
                <Title
                  title={this.state.groupsDetails?.name}
                  style={{marginLeft: scale(15), color: theme.colors.black}}
                />
                {singleChatId !== '1' && (
                  <View style={styles.description}>
                    <Label title={'Group Description'} style={styles.title} />
                    <Label
                      title={this.state.groupsDetails?.description}
                      style={styles.descText}
                    />
                  </View>
                )}
                {singleChatId !== '1' && (
                  <View style={[styles.description, {marginTop: scale(0)}]}>
                    <Label
                      title={
                        this.state.groupsDetails?.rules
                          ? 'Group Rules'
                          : 'No rules'
                      }
                      style={styles.title}
                    />
                    <Label
                      title={this.state.groupsDetails?.rules}
                      style={styles.descText}
                    />
                  </View>
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
                    {this.state.linksData[0]?.data.length > 0 ||
                    this.state.linksData[1]?.data.length > 0 ||
                    this.state.linksData[2]?.data.length > 0 ||
                    this.state.linksData[3]?.data.length > 0 ? (
                      <View style={styles.nodataComponent}>
                        <Label title={getLocalText('Groups.nolink')} />
                      </View>
                    ) : (
                      <SectionList
                        sections={this.state.linksData}
                        key={'_'}
                        keyExtractor={item => '_' + item?.id}
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
                    {this.state.docsObject[0]?.data.length > 0 ||
                    this.state.docsObject[1]?.data.length > 0 ||
                    this.state.docsObject[2]?.data.length > 0 ||
                    this.state.docsObject[3]?.data.length > 0 ? (
                      <SectionList
                        sections={this.state.docsObject}
                        key={'*'}
                        keyExtractor={item => '*' + item?.id}
                        renderItem={this.renderDocument}
                        renderSectionHeader={this._renderSectionHeader}
                        style={{height: theme.SCREENHEIGHT * 0.45}}
                        contentContainerStyle={{paddingBottom: scale(20)}}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                      />
                    ) : (
                      <View style={styles.nodataComponent}>
                        <Label title={getLocalText('Groups.noDoc')} />
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {this.state.mediaArray[0]?.data.length > 0 ||
                    this.state.mediaArray[1]?.data.length > 0 ||
                    this.state.mediaArray[2]?.data.length > 0 ||
                    this.state.mediaArray[3]?.data.length > 0 ? (
                      <SectionList
                        key={'#'}
                        keyExtractor={item => '#' + item?.id}
                        renderItem={this._renderSectionListItem}
                        renderSectionHeader={this._renderSectionHeader}
                        numColumns={3}
                        columnWrapperStyle={styles.sectionCol}
                        style={{
                          height: theme.SCREENHEIGHT,
                        }}
                        contentContainerStyle={{paddingBottom: scale(20)}}
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        sections={this.state.mediaArray}
                      />
                    ) : (
                      <View style={styles.nodataComponent}>
                        <Label
                          title={
                            !this.state.isLoading &&
                            getLocalText('Groups.nomedia')
                          }
                        />
                      </View>
                    )}
                  </>
                )}
              </View>
            ) : null}
          </ScrollView>
        )}

        <FullMediaModel
          isShow={this.state.fullScreenMedia}
          closeModel={this.handleClose}
          postImages={this.state.mediaData}
        />
        <ReportModel
          isVisible={this.state.reportModel}
          toggleReportmodel={this.closeReport}
          data={this.state.groupsDetails}
          reportGroup={true}
        />
        <ReportDetailsModel
          show={this.state.reportDetails}
          closeModal={this.closeReportDetails}
          reasonList={reportReasonList}
          reportType={singleChatId !== '1' && BLOCKTYPES.REPORT_GROUP}
          postData={singleChatId !== '1' && true}
        />
        <PostponedModel
          isVisible={this.state.postPone}
          close={this.closePostpone}
        />
        {/* <GroupOptions
          isShow={this.state.userOptions}
          handleClose={this.closeGroupOptions}
          adminId={this.props?.route?.params?.groupData?.group_admin_id}
          loginUserId={this.props.userData.id}
        /> */}
        <Loader loading={this.state.loading} />
        <Menus
          isMenu={this.state.showOptions}
          menuData={this.state.menuData}
          handleMenu={this.handleMenu}
          menuMainContainer={{
            marginTop: -scale(5),
          }}
        />

        <ConfirmationModel
          isVisible={this.state.exitGroupModel || this.state.deleteModel}
          type={this.state.exitGroupModel ? 'groupexit' : ''}
          close={
            this.state.exitGroupModel ? this.exitGroupAction : this.deleteGroup
          }
        />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(18),
    marginTop: scale(20),
  },
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  itemButton: {
    marginLeft: scale(7),
    marginBottom: scale(7),
    width: theme.SCREENWIDTH / 3 - 10,
    height: theme.SCREENWIDTH / 3 - 10,
  },
  sectionCol: {
    borderWidth: 3,
    borderColor: theme.colors.white1,
  },
  tabView: {
    marginBottom: scale(5),
    marginHorizontal: scale(14),
  },
  tabViewUpdate: {
    marginHorizontal: scale(14),
    marginTop: scale(15),
  },
  columnWrapperStyle: {
    flexWrap: 'wrap',
    flex: 1,
    marginTop: 5,
  },
  image: {width: '100%', height: scale(200), resizeMode: 'stretch'},
  switchView: {
    width: scale(105),
    height: scale(105),
    borderColor: theme.colors.grey10,
    borderWidth: 2,
  },
  switchContainer: {position: 'absolute', right: scale(15)},
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  scroll: {width: '100%'},
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  titleText: {
    color: theme.colors.grey10,
    left: scale(10),
  },
  divider: {
    backgroundColor: theme.colors.divider1,
    marginHorizontal: scale(20),
    height: scale(1),
    width: '90%',
    marginVertical: scale(20),
  },
  description: {
    backgroundColor: theme.colors.blue,
    margin: scale(10),
    padding: scale(8),
    borderRadius: scale(10),
    marginHorizontal: scale(15),
  },
  title: {
    left: scale(5),
    color: theme.colors.white,
    fontFamily: theme.fonts.muktaBold,
    fontSize: scale(14),
  },
  descText: {
    left: scale(5),
    color: theme.colors.white,
  },
  members: {
    color: theme.colors.black,
    marginBottom: scale(5),
    marginLeft: scale(20),
  },
  filterBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scale(11),
    paddingHorizontal: '7.4%',
    borderRadius: scale(20),
    marginHorizontal: scale(5),
  },
  nodataComponent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.SCREENHEIGHT / 2.5,
  },
  width85: {
    width: '85%',
  },
});

const mapStateToProps = state => {
  const userData = state.UserInfo.data;
  const notification = state.groupsReducer.groupNotication;
  const created_g_count = state.UserInfo.creaetedGroupCount;
  const reportReasonList = state.PostReducer.reportReasonList;
  const reportGroupPayload = state.groupsReducer.reportGroupPayload;
  return {
    userData,
    notification,
    created_g_count,
    reportReasonList,
    reportGroupPayload,
  };
};
export default connect(mapStateToProps, {
  reportGroup,
  manageNotification,
})(GroupInformation);
