import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  SearchBar1,
  Loader,
  OfflineModel,
} from '../Components';
import {Config, scale, theme, images} from '../Utils';
import {getLocalText} from '../Locales/I18n';
import {API, getAPICall} from '../Utils/appApi';
import {getWeekDay} from '../Utils/helper';
import {SCREEN_TYPE} from '../Utils/StaticData';
let loadMoreData = false;
export default class Interactions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      intrections: [],
      loadding: true,
      loadmore: false,
      page: 1,
      totalPage: 1,
    };
  }
  componentDidMount() {
    this.getInteractionsList();
  }
  getInteractionsList = async () => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.intraction);
      if (response.error) {
        this.setState({loadding: false});
      } else {
        if (response.success) {
          let data = response.data;
          this.setState({
            intrections: data,
            loadding: false,
            totalPage: response.total_page,
          });
        }
      }
    } catch (error) {}
  };
  //render Interactions list
  renderInteractions = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate('InteractionsDetails', {
            postId: item?.post_id,
          });
        }}
        style={styles.userView}
        key={index}>
        <View>
          <View style={[styles.row]}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('UserDataSpecific', {
                  id: item?.user_id,
                  screenName: SCREEN_TYPE.NEW_USER,
                });
              }}>
              <FastImage
                source={
                  item?.user_pic?.optimize
                    ? {uri: item?.user_pic?.optimize}
                    : images.defaultUser
                }
                style={styles.userPic}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('UserDataSpecific', {
                  id: item?.user_id,
                  screenName: SCREEN_TYPE.NEW_USER,
                });
              }}>
              <Text style={{...styles.name, textDecorationLine: 'underline'}}>
                {item?.user_name}
              </Text>
            </TouchableOpacity>
            <Label
              title={
                getWeekDay(moment(item?.created_at).format('ddd')) +
                ' ' +
                moment(item?.created_at).format('hh:mm')
              }
              style={styles.label}
            />
          </View>

          <Label
            title={
              item?.is_like === true
                ? getLocalText('Timeline.likepost')
                : item?.is_share === true
                ? getLocalText('Timeline.sharepost')
                : getLocalText('Timeline.commentpost')
            }
            style={[styles.activity]}
          />
          <Text style={styles.activity} numberOfLines={2}>
            {item?.comment}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  //load next page posts
  loadMore = async () => {
    if (this.state.intrections) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let response = await getAPICall(API.intraction + '?page=' + page);
          let data = [...this.state.intrections, ...response.data];
          if (response.success) {
            this.setState({
              intrections: data,
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
    let response = await getAPICall(API.intraction + '?page=' + 1);
    if (response.success) {
      await this.setState({
        intrections: response.data,
        refreshing: false,
      });
    } else {
      this.setState({refreshing: false});
    }
  };
  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };
  render() {
    const {intrections, loadding} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <SearchBar1
          {...this.props}
          title={getLocalText('UserData.interaction')}
          onNotificationPress={() => {
            this.notificationPress();
          }}
          searchText={this.state.searchText}
          onSearchText={(txt) => this.setState({searchText: txt})}
        />
        <FlatList
          data={intrections}
          extraData={this.state}
          keyExtractor={(_, index) => index.toString()}
          renderItem={this.renderInteractions}
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
              refreshing={this.state.loadding}
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
    marginBottom: scale(5),
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(10),
    paddingVertical: scale(10),
    borderRadius: scale(20),
  },
  userPic: {
    height: scale(30),
    width: scale(30),
    resizeMode: 'cover',
    borderRadius: scale(25),
    marginLeft: scale(5),
  },
  label: {color: theme.colors.grey10, position: 'absolute', right: scale(0)},
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(14),
    color: theme.colors.blue,
    marginLeft: scale(8),
  },
  activity: {
    marginLeft: theme.SCREENWIDTH * 0.12,
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
    width: theme.SCREENWIDTH * 0.78,
    overflow: 'visible',
  },
  loaddingCon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.SCREENHEIGHT * 0.75,
  },
  list: {height: theme.SCREENHEIGHT * 95, marginTop: scale(20)},
});
