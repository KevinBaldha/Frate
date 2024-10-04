import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  ScreenContainer,
  BackgroundChunk,
  Loader,
  HeaderView,
  OfflineModel,
} from '../Components';
import {Config, scale, theme} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
let loadMoreData = false;
export default class FriendRequestList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      requestList: [],
      loadding: true,
      loadmore: false,
      page: 1,
      totalPage: 1,
    };
  }
  componentDidMount() {
    this.getFriendReqestLists();
  }
  getFriendReqestLists = async () => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.friendReqList);
      if (response.error) {
        this.setState({loadding: false});
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            requestList: data === 'No pending requests found.' ? '' : data,
            loadding: false,
            totalPage: response.total_page,
          });
        }
      }
    } catch (error) {}
  };
  //render friend  list
  renderFriendList = ({item, index}) => {
    return (
      <View style={styles.userView} key={index}>
        <View style={styles.row}>
          <Text style={[styles.name, {textDecorationLine: 'underline'}]}>
            {item?.sender_name}
          </Text>
          <View />
        </View>

        <View style={styles.blockView}>
          <TouchableOpacity
            onPress={() => {
              this.handleAction(item?.sender_id, 'accepted', index);
            }}
            style={{...styles.btnView, backgroundColor: theme.colors.green3}}>
            <Icon name="check" size={scale(19)} color={theme.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.handleAction(item?.sender_id, 'denied', index);
            }}
            style={{
              ...styles.btnView,
              backgroundColor: theme.colors.red1,
              marginLeft: scale(5),
            }}>
            <Icon name="x" size={scale(19)} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  //load next page posts
  loadMore = async () => {
    if (this.state.requestList) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let response = await getAPICall(
            API.getFriendReqestLists + '?page=' + page,
          );
          let data = [...this.state.requestList, ...response.data];
          if (response.success) {
            this.setState({
              requestList: data,
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
    this.setState({refreshing: true, page: 1});
    let response = await getAPICall(API.friendReqList);
    if (response.success) {
      await this.setState({
        requestList:
          response.data === 'No pending requests found.' ? '' : response.data,
        refreshing: false,
      });
    } else {
      this.setState({refreshing: false});
    }
  };

  //handle frined req action"
  handleAction = async (id, status, index) => {
    let requestUpdate = new FormData();
    requestUpdate.append('user_id', id);
    requestUpdate.append('status', status);
    try {
      let userRequest = await postAPICall(
        API.friendrequestUpdate,
        requestUpdate,
      );
      if (userRequest.error) {
        Alert.alert(userRequest.errorMsg);
      } else {
        this.state.requestList.splice(index, 1);
        this.setState({requestList: this.state.requestList});
      }
    } catch (error) {}
  };

  render() {
    const {requestList, loadding} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView
          title={getLocalText('UserData.friendlist')}
          {...this.props}
        />
        <FlatList
          data={requestList}
          extraData={this.state}
          keyExtractor={(_, index) => index.toString()}
          renderItem={this.renderFriendList}
          contentContainerStyle={styles.blockmain}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.loaddingCon}>
              {Config.NO_DATA_COMPO(
                loadding,
                getLocalText('ErrorMsgs.emptyList'),
              )}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
          ListFooterComponent={this.renderFooter.bind(this)}
          onEndReachedThreshold={0.2}
          onEndReached={this.loadMore}
        />
        {this.state.loadding && <Loader loading={this.state.loadding} />}
        <OfflineModel />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.31),
    right: -(theme.SCREENHEIGHT * 0.39),
    transform: [{rotate: '75deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.47),
    left: -(theme.SCREENHEIGHT * 0.36),
    transform: [{rotate: '75deg'}],
  },
  userView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(10),
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(10),
    paddingVertical: scale(18),
    borderRadius: scale(20),
  },
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(14),
    color: theme.colors.blue,
    marginLeft: scale(8),
  },
  blockmain: {
    paddingHorizontal: scale(23),
    paddingBottom: scale(10),
    paddingTop: scale(15),
  },
  row: {
    flexDirection: 'row',
    width: theme.SCREENWIDTH * 0.55,
    overflow: 'visible',
  },
  loaddingCon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.SCREENHEIGHT * 0.75,
  },
  btnView: {
    height: scale(30),
    width: scale(30),
    borderRadius: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockView: {
    position: 'absolute',
    right: scale(10),
    flexDirection: 'row',
  },
  list: {height: theme.SCREENHEIGHT * 95, marginTop: scale(20)},
});
