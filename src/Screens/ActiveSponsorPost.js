/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable quotes */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {connect} from 'react-redux';
import Share from 'react-native-share';
import {
  ScreenContainer,
  BackgroundChunk,
  HeaderView,
  PostCard,
  ImagesViewModel,
  PostOptions,
  Loader,
  ReportModel,
  ReportDetailsModel,
  PostponedModel,
  OfflineModel,
} from '../Components';
import {scale, theme, Api, Config} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, baseUrlForShare, getAPICall} from '../Utils/appApi';
import {
  postLikeShareSave,
  susPendNotification,
  blockAction,
  exitGroup,
} from '../Redux/Actions';
import {BLOCKTYPES, DeepLink, SCREEN_TYPE} from '../Utils/StaticData';

let loadMoreData = false;
class ActiveSponsorPost extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      loadding: false,
      postData: [],
      options: [
        {icon: 'bookmark', name: getLocalText('Timeline.save')},
        {icon: 'bell', name: getLocalText('Timeline.suspendnotification')},
        {icon: 'eye-off', name: getLocalText('Timeline.hide')},
        {icon: 'log-out', name: getLocalText('GroupInfo.leavegroup')},
        {icon: 'copy', name: getLocalText('Timeline.copylink')},
      ],
      postOptionIndex: '',
      postOption: '',
      scrollFlat: '',
      imagesView: false,
      postDetails: '',
      page: 1,
      refreshing: false,
      totalPage: 1,
      loadmore: false,
      reportModel: false,
      reportDetails: false,
      postPone: false,
      postReport: '',
    };
  }

  componentDidMount() {
    this.getSponsorPost();
  }

  //sponsor post get..
  getSponsorPost = async () => {
    this.setState({loadding: true});
    let {page} = this.state;
    try {
      let url =
        getLocalText('Settings.mySponsor') === this.props.route.params.title
          ? API.getMySponsorPosts
          : API.getSponsorPost;
      let success = await getAPICall(url + page);
      if (success.error) {
        this.setState({loadding: false});
      } else {
        this.setState({postData: success?.data, loadding: false});
        // Alert.alert(success.error, 'There is no data found');

        return (
          <View style={styles.loaddingCon}>
            {/* {Config.NO_DATA_COMPO(this.state.loadding)} */}
            {this.state.loadding ? (
              Config.NO_DATA_COMPO(this.state.loadding)
            ) : (
              <Text style={styles.textContainer}>
                {getLocalText('ErrorMsgs.emptyList')}
              </Text>
            )}
          </View>
        );
      }
    } catch (error) {
      this.setState({loadding: false});
      console.log('getSponsorPost API catchError', error);
    }
  };

  onLikePress = async (item, index) => {
    try {
      await this.props.postLikeShareSave(item?.id, 'like');
      if (this.props.isPostLike) {
        this.state.postData[index].is_like =
          !this.state.postData[index].is_like;
        if (this.state.postData[index].is_like) {
          this.state.postData[index].total_like =
            this.state.postData[index].total_like + 1;
        } else {
          this.state.postData[index].total_like =
            this.state.postData[index].total_like - 1;
          this.state.postData[index].emoji = null;
        }
        this.setState({postData: this.state.postData}, () => {});
      }
    } catch (error) {
      // this.props.isPostLoading(0);
    }
  };

  //post save
  handleSavePost = async item => {
    let postIndex = this.state.postOptionIndex;

    try {
      await this.props.postLikeShareSave(item, 'save');
      if (this.props.isPostLike) {
        this.state.postData[postIndex].is_save =
          !this.state.postData[postIndex].is_save;
        this.setState({postData: this.state.postData});
      }
    } catch (error) {
      console.log('handleSavePost error >', error);
    }
  };

  handleOptions = async (index, item, data) => {
    this.postOptionClose();

    if (index === -2) {
      this.props.navigation.push('Statistics', {data: data});
    } else if (index === 4) {
      //copy link
      Clipboard.setString(baseUrlForShare + item);
    } else if (index === 0) {
      //save post
      this.handleSavePost(item);
    } else if (index === 1) {
      //suspend user notifcation
      this.props.susPendNotification(data.group?.id, data?.user_id);
    } else if (index === 3) {
      //exit group model
      this.props.exitGroup(data.group?.id);
    } else if (index === 2) {
      //post hide
      try {
        let postIndex = this.state.postOptionIndex;
        await this.props.postLikeShareSave(item, 'hide');
        this.state.postData.splice(postIndex, 1);
        this.setState({postData: this.state.postData});
      } catch (error) {
        this.setState({loadding: false});
      }
    }
  };

  postOptionClose = () => {
    this.setState({
      postOption: '',
      postOptionIndex: '',
      handleOption: !this.state.handleOption,
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
  handleImagesView = item => {
    this.setState({imagesView: !this.state.imagesView, postDetails: item});
  };
  handleImagesClose = () => {
    this.setState({imagesView: false});
  };
  onCommentPress = (item, index) => {
    this.state.postData[index].commentOpen =
      !this.state.postData[index].commentOpen;
    this.setState({postData: this.state.postData});
  };

  handleCommentTxt = (text, data) => {
    data.commentTxt = text;
    this.setState({postData: this.state.postData});
  };
  sendComment = (item, index) => {
    this.setState({
      commenttxt: '',
    });
    Keyboard.dismiss();
    this.onCommentPress(item, index);
  };

  onShare = async item => {
    const link = DeepLink + `?type=timeline&id=` + item?.item?.id;
    Share.open({url: link});
    try {
      await this.props.postLikeShareSave(item?.item?.id, 'share');
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  handlePressLike = async (item, index, evt) => {
    this.setState({
      postLikeOption: item?.id,
      postLikeOptionIndex:
        this.state.postLikeOptionIndex === index ? '' : index,
      indicatorOffsetForLike: evt.nativeEvent.pageY,
    });
  };
  renderPost = ({item, index}) => {
    return (
      <View
        style={{paddingVertical: scale(10)}}
        onStartShouldSetResponder={event => {
          this.handleOptions();
        }}>
        <PostCard
          item={item}
          index={index}
          {...this.state}
          handlePostModal={this.handlePostModal}
          onLikePress={this.onLikePress}
          // handleOptions={this.handleOptions}
          onCommentPress={this.onCommentPress}
          onPressSend={this.sendComment}
          onChangeText={text => {
            this.handleCommentTxt(text, item);
          }}
          value={this.state.commenttxt}
          optionsIconColor={this.state.handleOption}
          postId={this.state.postOption}
          openImageView={this.handleImagesView}
          onSharePress={this.onShare}
          flatListScroll={this.state.scrollFlat}
          userImg={
            !this.props?.userData ||
            this.props?.userData?.user_pic?.original === undefined
              ? ''
              : this.props?.userData?.user_pic?.original
          }
          bookmark
          showOption
          onPressGroup={this.onPressGroup}
          onPressProfile={this.onPressProfile}
          updateCommentCount={this.updateCommentCount}
          counterShow={true}
          onPressSponsor={this.onPressSponsor}
          userData={this.props.userData}
          onPressSharePost={this.onPressProfile}
          handleMsgPopUp={this.handleMsgPopUp}
          handlePostLike={this.handlePressLike}
        />
      </View>
    );
  };

  handleMsgPopUp = async item => {
    const userID = item?.user_id;
    let chatResponse = await getAPICall(API.chat + userID);
    this.props.navigation.navigate('Chat', {
      data: chatResponse.data,
      singleChat: '1',
    });
  };

  onPressSponsor = () => {
    this.props.navigation.navigate('Statistics');
  };

  updateCommentCount = index => {
    this.state.userPost[index].total_comment =
      this.state.userPost[index].total_comment + 1;
    this.setState({userPost: this.state.userPost});
  };

  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});
    let page = 1;
    try {
      let success = await getAPICall(API.getSponsorPost + '?page=' + page);
      if (success.error) {
        this.setState({refreshing: false});
      } else {
        this.setState({postData: success?.data, refreshing: false});
      }
    } catch (error) {
      this.setState({refreshing: false});
      console.log('getSponsorPost API catchError', error);
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
    if (this.state.postData) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let success = await getAPICall(API.getSponsorPost + '?page=' + page);
          let data = [...this.state.userPost, ...success.data];
          this.setState({
            userPost: data,
            loadmore: false,
            page: page,
          });
          loadMoreData = false;
          //sposrt
        }
      } else {
        this.setState({loadmore: false});
      }
    }
  };

  onPressGroup = item => {
    const {navigation} = this.props;
    navigation.navigate('GroupDetails', {
      item: {groupData: item?.group, joined: false},
    });
  };

  redirectToUserDetails = async (item, userId) => {
    const {navigation} = this.props;
    navigation.navigate('UserDataSpecific', {
      data: item?.user_id ? item?.user_id : item,
      id: userId,
      screenName: SCREEN_TYPE.NEW_USER,
    });
  };

  onPressProfile = async (item, index) => {
    this.redirectToUserDetails(item, item?.user_id);
  };

  //report post >>>
  closeReport = type => {
    if (type === null) {
      this.setState({
        reportModel: !this.state.reportModel,
      });
    } else {
      this.setState({
        reportType:
          type === 0 ? BLOCKTYPES.REPORT_POST : BLOCKTYPES.REPORT_GROUP,
        reportModel: !this.state.reportModel,
      });
      setTimeout(() => {
        this.setState({
          reportDetails: !this.state.reportDetails,
        });
      }, 700);
    }
  };
  //report user
  closeReportDetails = async (details, resion) => {
    if (details === undefined || resion === undefined) {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });
    } else {
      this.setState({
        reportDetails: !this.state.reportDetails,
      });

      let blockUser = new FormData();
      if (this.state.reportType === BLOCKTYPES.REPORT_GROUP) {
        blockUser.append('group_id', this.state.postReport.group.id);
        blockUser.append('type', this.state.reportType);
        blockUser.append('details', details);
        blockUser.append('reason', resion);
        this.props.blockAction(1, blockUser);
      } else {
        blockUser.append('post_id', this.state.postReport.id);
        blockUser.append('type', this.state.reportType);
        blockUser.append('details', details);
        blockUser.append('reason', resion);
        this.props.blockAction(0, blockUser);
      }

      // let blockUserSuccess = await postAPICall(API.blockUser, blockUser);
      // if (blockUserSuccess.success) {

      if (this.props.reportResponse) {
        setTimeout(() => {
          this.setState({
            postPone: !this.state.postPone,
          });
        }, 300);
      }

      //   await this.updateFeed();
      // } else {
      //   Alert.alert(getLocalText('ErrorMsgs.fillrequire'));
      //   setTimeout(() => {
      //     this.updateFeed();
      //   }, 151);
      // }
    }
  };

  closePostpone = () => {
    this.setState({postPone: false});
  };
  render() {
    const {loadding, postData} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          {...this.props}
          title={
            this.props.route.params.title
              ? this.props.route.params.title
              : getLocalText('Settings.sponsor')
          }
        />
        <FlatList
          ref={ref => (this.FlatListRef = ref)}
          contentContainerStyle={{
            paddingVertical: scale(10),
            paddingTop: scale(30),
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
          keyExtractor={(item, index) => item?.id.toString()}
          data={postData}
          extraData={[this.state, this.props]}
          renderItem={this.renderPost}
          onScroll={e => {
            this.setState({scrollFlat: e.nativeEvent.contentOffset.y});
            this.postOptionClose();
          }}
          ListEmptyComponent={() => (
            <View style={styles.nodata}>
              {Config.NO_DATA_COMPO(
                loadding,
                getLocalText('ErrorMsgs.emptyList'),
              )}
            </View>
          )}
          ListFooterComponent={this.renderFooter.bind(this)}
          onEndReached={this.loadMore}
        />
        {this.state.postOptionIndex !== '' &&
        this.state.postOption === postData[this.state.postOptionIndex].id ? (
          <PostOptions
            {...this.props}
            {...this.state}
            item={postData[this.state.postOptionIndex].id}
            data={postData[this.state.postOptionIndex]}
            isSponsored={postData[this.state.postOptionIndex].is_sponsored}
            handleOptions={this.handleOptions}
            userData={this.props.userData}
            singleOption={false}
            showStatic={true}
          />
        ) : null}
        <ImagesViewModel
          item={this.state.postDetails}
          isVisible={this.state.imagesView}
          close={this.handleImagesClose}
        />
        <OfflineModel />
        <ReportModel
          isVisible={this.state.reportModel}
          toggleReportmodel={this.closeReport}
          data={this.state.postReport}
        />
        <ReportDetailsModel
          show={this.state.reportDetails}
          closeModal={this.closeReportDetails}
          userData={this.props.userData}
        />
        <PostponedModel
          isVisible={this.state.postPone}
          close={this.closePostpone}
        />
        <Loader loading={loadding} />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.55),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '80deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.6),
    left: -(theme.SCREENHEIGHT * 0.5),
    transform: [{rotate: '80deg'}],
  },
  title: {
    marginLeft: scale(18),
    marginTop: scale(20),
    marginBottom: scale(10),
    color: theme.colors.black,
  },
  nodata: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.SCREENHEIGHT * 0.75,
  },
  textContainer: {fontSize: 20, color: 'black', alignSelf: 'center'},
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    // flex: 1,
    height: theme.SCREENHEIGHT * 0.7,
  },
});

const mapStateToProps = state => {
  const userData = state.UserInfo.data;
  const isPostLike = state.PostReducer.postLike;
  return {userData, isPostLike};
};

export default connect(mapStateToProps, {
  postLikeShareSave,
  exitGroup,
  susPendNotification,
  blockAction,
})(ActiveSponsorPost);
