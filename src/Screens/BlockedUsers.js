import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {connect} from 'react-redux';
import {
  ScreenContainer,
  SearchBar1,
  Label,
  BackgroundChunk,
  Loader,
  OfflineModel,
} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {Config, scale, images, theme} from '../Utils';
import {API, getAPICall, postAPICall} from '../Utils/appApi';
let loadMoreData = false;
class BlockedUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      blockUsers: [],
      loadding: '',
      filteredData: [],
      refreshing: false,
      page: 1,
      total: 1,
    };
  }
  componentDidMount() {
    this.getReportUserList();
  }
  //search
  search = (searchText) => {
    this.setState({searchText: searchText});
    let filteredData = this.state.blockUsers.filter(function (item) {
      return item?.name?.toLowerCase().includes(searchText?.toLowerCase());
    });
    this.setState({filteredData: filteredData});
  };

  getReportUserList = async () => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.blockUserList);
      if (response.error) {
        this.setState({loadding: false});
      } else {
        if (response.success) {
          let data = response.data;
          let total = response.total_page;
          this.setState({blockUsers: data, total: total, loadding: false});
        }
      }
    } catch (error) {}
  };
  //remove from block
  removeFromBlock = async (item) => {
    let blockUser = new FormData();
    blockUser.append('user_id', this.props.userData.id);
    blockUser.append('blocked_user_id', item);
    blockUser.append('details', 'details');
    blockUser.append('reason', 'resion');
    let blockUserSuccess = await postAPICall(API.blockUser, blockUser);
    if (blockUserSuccess.success) {
      this.getReportUserList();
    } else {
      Alert.alert(getLocalText('ErrorMsgs.fillrequire'));
    }
  };
  generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  //block users
  renderBlocks = ({item, index}) => {
    return (
      <View style={styles.userView} key={index}>
        <View
          style={{
            ...styles.userImgCon,
            borderColor: this.generateRandomColor(),
          }}>
          <FastImage
            source={
              item?.user_pic?.optimize
                ? {uri: item?.user_pic?.optimize}
                : images.AppLogo
            }
            style={styles.userPic}
          />
        </View>
        <Label
          title={item?.name}
          style={{
            marginLeft: scale(13),
          }}
        />
        <TouchableOpacity
          style={styles.blockView}
          onPress={() => {
            this.removeFromBlock(item?.user_id);
          }}>
          <Label title={'UNBLOCK'} style={styles.label} />
        </TouchableOpacity>
      </View>
    );
  };
  handleRefresh = async () => {
    try {
      let response = await getAPICall(API.blockUserList);
      if (response.error) {
        this.setState({refreshing: false});
      } else {
        if (response.success) {
          let data = response.data;
          let total = response.total_page;
          this.setState({
            blockUsers: data,
            refreshing: false,
            total: total,
            page: 1,
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
    if (this.state.blockUsers) {
      if (this.state.page <= this.state.total && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.total) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let response = await getAPICall(API.blockUserList + '?page=' + page);
          if (response.data) {
            let data = [...this.state.blockUsers, ...response.data];
            this.setState({
              loadmore: false,
              blockUsers: data,
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
  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };
  render() {
    const {blockUsers, loadding} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <SearchBar1
          {...this.props}
          title={getLocalText('UserData.blockuser')}
          onNotificationPress={() => {
            this.notificationPress();
          }}
          searchText={this.state.searchText}
          onSearchText={(txt) => this.search(txt)}
        />
        <FlatList
          data={
            this.state.filteredData && this.state.filteredData.length > 0
              ? this.state.filteredData
              : blockUsers
          }
          extraData={this.state}
          keyExtractor={(_, index) => index.toString()}
          renderItem={this.renderBlocks}
          contentContainerStyle={styles.blockmain}
          style={{height: theme.SCREENHEIGHT * 95}}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={this.renderFooter.bind(this)}
          onEndReachedThreshold={0.3}
          onEndReached={this.loadMore}
          ListEmptyComponent={() => (
            <View style={styles.loaddingCon}>
              {Config.NO_DATA_COMPO(loadding)}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
        />
        <Loader loading={this.state.loadding} />
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
  },
  userImgCon: {
    borderColor: theme.colors.grey10,
    borderWidth: 2,
    padding: scale(1),
    borderRadius: scale(28),
  },
  userPic: {
    height: scale(50),
    width: scale(50),
    resizeMode: 'cover',
    borderRadius: scale(25),
  },
  label: {color: theme.colors.blue},
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  blockmain: {
    paddingHorizontal: scale(23),
    paddingBottom: scale(10),
    paddingTop: scale(15),
  },
  blockView: {
    position: 'absolute',
    right: scale(10),
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT * 0.75,
  },
});
const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  return {userData};
};
export default connect(mapStateToProps)(BlockedUsers);
