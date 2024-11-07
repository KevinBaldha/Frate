/* eslint-disable react/no-unstable-nested-components */
import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  Loader,
  HeaderView,
  ReportPostCard,
  OfflineModel,
} from '../Components';
import externalStyle from '../Css';
import {getLocalText} from '../Locales/I18n';
import {Config, scale, theme} from '../Utils';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
import {BLOCKTYPES, REPORTSTATUS} from '../Utils/StaticData';
let loadMoreBlockedData = false;
let loadMoreBlockUsers = false;
let loadMoreData = false;
class ReportedContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      blockuserList: '',
      types: [
        {
          id: 1,
          title: getLocalText('GroupInfo.user'),
        },
        {
          id: 2,
          title: getLocalText('GroupInfo.post'),
        },
        // {
        //   id: 3,
        //   title: getLocalText('GroupInfo.postreport'),
        // },
      ],
      reportedPost: [],
      reportedUserList: [],
      type: 1,
      loadding: false,
      loaddingPost: false,
      loaddingUser: false,
      refreshing: false,
      refreshingPost: false,
      refreshingUser: false,
      loadmore: false,
      page: 1,
      total: 1,
      reportTotalpage: 1,
      reportCurrentPage: 1,
      postCurrentPage: 1,
      postTotalPage: 1,
      groupId:
        this.props.route.params.data === undefined
          ? ''
          : this.props.route.params.data.id,
    };
  }

  componentDidMount() {
    this.getBlockUsers();
    this.reportedList();
    this.getReportedUser();
  }

  //get post report list
  reportedList = async (refresh) => {
    try {
      refresh
        ? this.setState({refreshingPost: true})
        : this.setState({loaddingUser: true});
      let list = new FormData();
      list.append('type', BLOCKTYPES.REPORT_POST);
      list.append('group_id', this.state.groupId);
      list.append('status', REPORTSTATUS.ACCEPTED);
      let response = await postAPICall(API.reportedList, list);
      if (response.error) {
        this.setState({loaddingUser: false, refreshingPost: false});
      } else {
        if (response.success) {
          this.setState({
            reportedPost: response.data,
            loaddingUser: false,
            refreshingPost: false,
            postCurrentPage: 1,
            postTotalPage: response.total_page,
          });
        }
      }
    } catch (error) {}
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
  //load next user list
  loadMore = async () => {
    if (this.state.reportedPost) {
      if (
        this.state.postCurrentPage <= this.state.postTotalPage &&
        !loadMoreData
      ) {
        this.setState({loadmore: true});
        loadMoreData = true;
        let list = new FormData();
        list.append('type', BLOCKTYPES.REPORT_POST);
        list.append('group_id', this.state.groupId);
        let response = await postAPICall(
          API.reportedList + '?page=' + (this.state.postCurrentPage + 1),
          list,
        );
        if (response.data) {
          let data = [...this.state.reportedPost, ...response.data];
          this.setState({
            reportedPost: data,
            loadmore: false,
            postCurrentPage: this.state.postCurrentPage + 1,
          });
          loadMoreData = false;
        }
      } else {
        this.setState({loadmore: false});
      }
    }
  };

  // report userlists
  getReportedUser = async (refresh) => {
    try {
      refresh
        ? this.setState({refreshingUser: true})
        : this.setState({loaddingPost: true});

      let list = new FormData();
      list.append('type', BLOCKTYPES.REPORT_USER);
      list.append('group_id', this.state.groupId);
      list.append('status', REPORTSTATUS.PENDING);
      let response = await postAPICall(API.reportedList, list);
      if (response.error) {
        this.setState({loaddingPost: false});
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            reportedUserList: data,
            loaddingPost: false,
            refreshingUser: false,
            reportTotalpage: response.total_page,
            reportCurrentPage: 1,
          });
        }
      }
    } catch (error) {}
  };

  loadmoreBlockUsers = async () => {
    if (this.state.reportedUserList) {
      if (
        this.state.reportCurrentPage <= this.state.reportTotalpage &&
        !loadMoreBlockUsers
      ) {
        this.setState({loadmore: true});
        loadMoreBlockUsers = true;
        let list = new FormData();
        list.append('type', BLOCKTYPES.REPORT_USER);
        list.append('group_id', this.state.groupId);
        list.append('status', REPORTSTATUS.PENDING);
        let response = await postAPICall(
          API.reportedList + '?page=' + (this.state.reportCurrentPage + 1),
          list,
        );
        if (response.data) {
          let data = [...this.state.reportedUserList, ...response.data];

          await this.setState({
            reportedUserList: data,
            loadmore: false,
            reportCurrentPage: this.state.reportCurrentPage + 1,
          });
          loadMoreBlockUsers = false;
        }
      } else {
        this.setState({loadmore: false});
      }
    }
  };
  //get block users
  getBlockUsers = async (type) => {
    try {
      type === true
        ? this.setState({refreshing: true})
        : this.setState({loadding: true});
      let response = await getAPICall(API.blockUserList + this.state.groupId);
      if (response.error) {
        this.setState({loadding: false, refreshing: false});
      } else {
        if (response.success) {
          let data = response.data;
          let total = response.total_page;
          this.setState({
            blockuserList: data,
            total: total,
            loadding: false,
            refreshing: false,
            page: 1,
          });
        }
      }
    } catch (error) {}
  };

  loadmoreBlockeds = async () => {
    if (this.state.blockuserList) {
      if (
        this.state.page <= this.state.reportTotalpage &&
        !loadMoreBlockedData
      ) {
        let page = this.state.page + 1;
        if (page < this.state.reportTotalpage) {
          this.setState({loadmore: true});
          loadMoreBlockedData = true;
          let response = await getAPICall(
            API.blockUserList + this.state.groupId + '&page=' + page,
          );
          if (response.data) {
            let data = [...this.state.blockuserList, ...response.data];
            this.setState({
              blockuserList: data,
              loadmore: false,
              page: page,
            });
            loadMoreBlockedData = false;
          }
        }
      } else {
        this.setState({loadmore: false});
      }
    }
  };

  //display block users
  blockUsers = ({item, index}) => {
    return (
      <View style={styles.userView} key={index}>
        <LinearGradient
          colors={['#eded23', '#123998', '#f6a', 'lime']}
          style={{
            ...styles.userImgCon,
          }}>
          <View style={styles.gradientsp}>
            <FastImage
              source={{uri: item?.blocked_user_pic?.original}}
              style={styles.userPic}
            />
          </View>
        </LinearGradient>
        <Label
          title={item?.blocked_user_name}
          style={{
            marginLeft: scale(13),
          }}
        />
        <View style={styles.blockView}>
          <TouchableOpacity
            onPress={() => {
              this.onPressAction(item, index, REPORTSTATUS.UNBLOCKED, 'user');
            }}
            style={{...styles.btnView}}>
            <Label title={'UNBLOCK'} style={{color: theme.colors.red}} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  //render post block block and group block
  renderList = (item, index, type) => {
    return (
      <ReportPostCard
        item={item}
        index={index}
        type={type}
        onPress={this.onPressAction}
      />
    );
  };
  // bolck post actions
  onPressAction = async (item, index, status, type) => {
    try {
      let actionform = new FormData();
      actionform.append('status', status);
      actionform.append('report_id', item?.id);

      let reportAction = await postAPICall(API.updateReportStatus, actionform);
      if (reportAction.error) {
        this.setState({loadding: false});
      } else {
        if (reportAction.success) {
          if (type === 'post') {
            this.state.reportedUserList.splice(index, 1);
            this.setState({reportedUserList: this.state.reportedUserList});
          } else if (type === 'user') {
            this.state.blockuserList.splice(index, 1);
            this.setState({blockuserList: this.state.blockuserList});
          } else if (type === 'postReported') {
            this.state.reportedPost.splice(index, 1);
            this.setState({reportedPost: this.state.reportedPost});
          }
        }
      }
    } catch (error) {}
  };
  handleCategory = (index) => {
    this.setState({type: index});
  };
  render() {
    const {blockuserList, loadding, reportedUserList, type, reportedPost} =
      this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView title={getLocalText('GroupInfo.report')} {...this.props} />
        <View style={styles.fillterCon}>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: scale(18)}}>
            {this.state.types.map((data, index) => {
              return (
                <TouchableOpacity
                  key={index.toString()}
                  onPress={() => this.handleCategory(data.id)}
                  style={[
                    styles.fillterbtn,
                    externalStyle.shadow,
                    {
                      backgroundColor:
                        data.id === this.state.type
                          ? theme.colors.grey14
                          : theme.colors.white,
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
        {type === 1 ? (
          <FlatList
            data={blockuserList}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this.getBlockUsers(true)}
              />
            }
            extraData={this.state}
            keyExtractor={(_, index) => index.toString()}
            renderItem={this.blockUsers}
            ListFooterComponent={this.renderFooter.bind(this)}
            onEndReachedThreshold={0.3}
            onEndReached={this.loadmoreBlockeds}
            contentContainerStyle={styles.blockmain}
            style={{height: theme.SCREENHEIGHT * 95}}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.loaddingCon}>
                {Config.NO_DATA_COMPO(
                  loadding,
                  getLocalText('ErrorMsgs.emptyList'),
                )}
              </View>
            )}
          />
        ) : type === 2 ? (
          <FlatList
            data={reportedUserList}
            extraData={this.state}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshingUser}
                onRefresh={() => {
                  this.getReportedUser(true);
                }}
              />
            }
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) => this.renderList(item, index, 'post')}
            contentContainerStyle={styles.blockmain}
            style={{height: theme.SCREENHEIGHT * 95}}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={this.renderFooter.bind(this)}
            onEndReachedThreshold={0.3}
            onEndReached={this.loadmoreBlockUsers}
            ListEmptyComponent={() => (
              <View style={styles.loaddingCon}>
                {Config.NO_DATA_COMPO(
                  this.state.loaddingUser,
                  getLocalText('ErrorMsgs.emptyList'),
                )}
              </View>
            )}
          />
        ) : (
          <FlatList
            data={reportedPost}
            extraData={this.state}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) =>
              this.renderList(item, index, 'postReported')
            }
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshingPost}
                onRefresh={() => {
                  this.reportedList(true);
                }}
              />
            }
            ListFooterComponent={this.renderFooter.bind(this)}
            onEndReachedThreshold={0.3}
            onEndReached={this.loadMore}
            contentContainerStyle={styles.blockmain}
            style={{height: theme.SCREENHEIGHT * 95}}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.loaddingCon}>
                {Config.NO_DATA_COMPO(
                  this.state.loaddingPost,
                  getLocalText('ErrorMsgs.emptyList'),
                )}
              </View>
            )}
          />
        )}
        <Loader
          loading={
            this.state.loadding ||
            this.state.loaddingPost ||
            this.state.loaddingUser
          }
        />
        <OfflineModel />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.31),
    right: theme.SCREENHEIGHT * 0.12,
    transform: [{rotate: '45deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.37),
    left: -(theme.SCREENHEIGHT * 0.58),
    transform: [{rotate: '65deg'}],
  },
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
  },
  userImgCon: {
    padding: scale(1.5),
    margin: 1,
    borderRadius: scale(28),
  },
  userPic: {
    height: scale(45),
    width: scale(45),
    resizeMode: 'cover',
    borderRadius: scale(25),
    padding: scale(2),
  },
  blockmain: {
    paddingHorizontal: scale(23),
    paddingBottom: scale(10),
    paddingTop: scale(15),
  },
  btnView: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fillterCon: {
    marginVertical: scale(10),
    justifyContent: 'space-around',
  },
  fillterbtn: {
    paddingHorizontal: scale(25),
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(11),
    borderRadius: scale(20),
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  blockView: {
    position: 'absolute',
    right: scale(10),
    flexDirection: 'row',
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
  },
  gradientsp: {
    padding: 2,
    backgroundColor: theme.colors.white,
    borderRadius: scale(25),
  },
});
const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  return {userData};
};
export default connect(mapStateToProps)(ReportedContent);
