import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  SearchBar,
  Loader,
} from '../Components';
import {Config, scale, theme} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall} from '../Utils/appApi';
import {setNewChatBadge} from '../Redux/Actions';
let loadMoreData = false;
class ChatList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      loading: false,
      loadmore: false,
      page: 1,
      totalPage: 1,
      chatHistory: [],
      localChatHistory: [],
      refreshing: false,
    };
  }

  componentDidMount() {
    this.getChatHistory();
    this.focusListener = this.props.navigation.addListener(
      'focus',
      async () => {
        this.getChatHistory();
        if (this.props.getNewChatBadge) {
          this.props.setNewChatBadge(false);
        }
      },
    );
  }

  componentWillUnmount() {
    this.focusListener();
  }

  getChatHistory = async () => {
    try {
      this.setState({loading: true});
      let response = await this.callHistoryApi(1);

      this.setState({loading: false});
      if (response.success) {
        let data = response.data;
        this.setState({
          chatHistory: data,
          totalPage: response.total_page,
          localChatHistory: data,
        });
      }
    } catch (error) {
      this.setState({loading: false});
    }
  };

  onPresstoChat = async (item) => {
    const userID = item?.user?.id;
    let chatResponse = await getAPICall(API.chat + userID);
    this.props.navigation.navigate('Chat', {
      data: chatResponse.data,
      singleChat: '1',
    });
  };

  //load next page posts
  loadMore = async () => {
    const {chatHistory} = this.state;
    if (chatHistory.length) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let response = await this.callHistoryApi(page);
          if (response.success) {
            let chatDatas = [...this.state.chatHistory, ...response.data];
            this.setState({
              chatHistory: chatDatas,
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
    if (this.state.loadmore) {
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

  callHistoryApi = async (page) => {
    let response = await getAPICall(API.getChatHistory + '?page=' + page);
    return response;
  };

  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});
    let response = await this.callHistoryApi(1);
    if (response.success) {
      this.setState({
        chatHistory: response.data,
        refreshing: false,
      });
    } else {
      this.setState({refreshing: false});
    }
  };

  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };
  handleSearch = async (txt) => {
    const {localChatHistory} = this.state;
    var searchedText = txt.trim();
    var filterData = localChatHistory.filter((item) =>
      (item?.user?.first_name + ' ' + item?.user?.last_name)
        .toString()
        .includes(searchedText),
    );
    this.setState({
      chatHistory: filterData,
      loading: false,
      searchText: txt,
    });
  };

  //render Interactions list
  renderChatList = ({item, index}) => {
    const {user} = item;
    return (
      <TouchableOpacity
        style={styles.userView}
        key={index}
        onPress={() => {
          this.onPresstoChat(item);
        }}>
        <FastImage
          source={{uri: user?.user_pic?.optimize}}
          style={styles.userPic}
        />
        <View>
          <View style={[styles.row, styles.width85]}>
            <View style={[styles.textView]}>
              <Text style={styles.name}>
                {user?.first_name} {user?.last_name}
              </Text>
            </View>
          </View>

          {/* last message should show here */}
          {/* <Text style={styles.activity} numberOfLines={1}>
            {item?.msg}
          </Text> */}
        </View>
        <View
          style={[
            styles.read,
            {
              backgroundColor:
                item?.highlight === 1 ? theme.colors.grey1 : theme.colors.blue,
            },
          ]}
        />
      </TouchableOpacity>
    );
  };

  render() {
    const {loading, chatHistory} = this.state;
    const {notificationBell} = this.props;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <Loader loading={loading} />
        <SearchBar
          {...this.props}
          //   title={getLocalText('UserData.interaction')}
          onNotificationPress={() => {
            this.notificationPress();
          }}
          // bellColor={notificationBell ? theme.colors.blue : theme.colors.grey1}
          bellColor={
            notificationBell ? theme.colors.blue : theme.colors.darkGrey
          }
          notificationBadge={notificationBell}
          searchText={this.state.searchText}
          customSearch
          onSearchText={this.handleSearch}
        />
        <Label
          title={getLocalText('Timeline.yourCon')}
          style={{marginLeft: scale(20), marginTop: scale(10)}}
        />
        <FlatList
          data={chatHistory}
          extraData={this.state}
          keyExtractor={(_, index) => index.toString()}
          renderItem={this.renderChatList}
          contentContainerStyle={styles.blockmain}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.loaddingCon}>
              {Config.NO_DATA_COMPO(loading)}
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
    marginBottom: scale(5),
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(5),
    paddingVertical: scale(10),
    borderRadius: scale(20),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  userPic: {
    height: scale(35),
    width: scale(35),
    resizeMode: 'cover',
    borderRadius: scale(20),
    marginLeft: scale(5),
  },
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(14),
    color: theme.colors.black,
    marginLeft: scale(8),
  },
  activity: {
    marginLeft: theme.SCREENWIDTH * 0.03,
    width: null,
    color: theme.colors.grey10,
    fontFamily: theme.fonts.muktaMedium,
    textDecorationLine: 'none',
  },
  blockmain: {
    paddingHorizontal: scale(23),
    paddingBottom: scale(10),
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
  list: {height: theme.SCREENHEIGHT * 95, marginTop: scale(20)},
  read: {
    backgroundColor: theme.colors.blue,
    height: scale(8),
    width: scale(8),
    borderRadius: scale(5),
    right: scale(5),
  },
  textView: {
    width: '100%',
    flexDirection: 'row',
  },
  width85: {
    width: '85%',
  },
});

const mapStateToProps = (state) => {
  const notificationBell = state.UserInfo.notificationBellIcon;
  const getNewChatBadge = state.UserInfo.newChatBadge;
  return {
    notificationBell,
    getNewChatBadge,
  };
};

export default connect(mapStateToProps, {
  setNewChatBadge,
})(ChatList);
