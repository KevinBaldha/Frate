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
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import {
  ScreenContainer,
  Label,
  BackgroundChunk,
  Loader,
  HeaderView,
  OfflineModel,
} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {Config, scale, images, theme} from '../Utils';
import {API, postAPICall} from '../Utils/appApi';

let loadMoreData = false;
class RequrestJoinGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      requestJoinList: [],
      loadding: '',
      refreshing: false,
      loadmore: false,
      page: 1,
      total: 1,
      groupDetails:
        this.props.route.params?.data?.group_id === undefined
          ? this.props.route.params?.data?.id
          : this.props.route.params?.data?.group_id === undefined
          ? this.props.rotate.params?.group_id
          : this.props.route.params.data.group_id,
    };
  }

  componentDidMount() {
    this.getReportUserList();
  }

  getReportUserList = async () => {
    try {
      this.setState({loadding: true});
      let requestForm = new FormData();
      requestForm.append(
        'group_id',
        this.state.groupDetails === undefined
          ? this.props.route.params.group_id
          : this.state.groupDetails,
      );
      let response = await postAPICall(API.userJoinRequest, requestForm);
      if (response.error) {
        this.setState({loadding: false});
      } else {
        if (response.success) {
          let data = response;
          this.setState({
            requestJoinList: data.data,
            loadding: false,
            page: response.current_page,
            total: data.total_page,
          });
        }
      }
    } catch (error) {}
  };

  generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  //group join users list
  renderGroupJoinList = ({item, index}) => {
    return (
      <View style={styles.userView} key={index}>
        <View
          style={{
            ...styles.userImgCon,
            // borderColor: this.generateRandomColor(),
          }}>
          <View
            // colors={item?.team[0]?.gradient_color}
            style={{
              ...styles.userImgCon,
            }}>
            <View style={styles.gradientsp}>
              <FastImage
                source={
                  item?.user_pic?.medium
                    ? {
                        uri: item?.user_pic?.medium,
                      }
                    : images.AppLogo
                }
                style={styles.userPic}
              />
            </View>
          </View>
        </View>
        <Label
          title={item?.first_name}
          style={{
            marginLeft: scale(13),
          }}
        />
        <View style={styles.blockView}>
          <TouchableOpacity
            onPress={() => {
              this.handleGroupJoin(1, item?.id, index);
            }}
            style={{...styles.btnView, backgroundColor: theme.colors.green3}}>
            <Icon name="check" size={scale(19)} color={theme.colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.handleGroupJoin(0, item?.id, index);
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
  handleGroupJoin = async (action, userId, index) => {
    let joinForm = new FormData();
    joinForm.append(
      'group_id',
      this.state.groupDetails === undefined
        ? this.props.route.params.group_id
        : this.state.groupDetails,
    );
    joinForm.append('user_id', userId);
    joinForm.append('status', action);

    let userRequest = await postAPICall(API.groupJoinRequest, joinForm);

    if (userRequest.error) {
      Alert.alert(userRequest.error);
    } else {
      this.state.requestJoinList.splice(index, 1);
      this.setState({requestJoinList: this.state.requestJoinList});
    }
  };
  handleRefresh = async () => {
    try {
      this.setState({refreshing: true});
      let requestForm = new FormData();
      requestForm.append(
        'group_id',
        this.state.groupDetails === undefined
          ? this.props.route.params.group_id
          : this.state.groupDetails,
      );
      let response = await postAPICall(API.userJoinRequest, requestForm);
      if (response.error) {
        this.setState({refreshing: false});
      } else {
        if (response.success) {
          let data = response;
          this.setState({
            requestJoinList: data.data,
            refreshing: false,
            page: Number(response.current_page),
            total: data.total_page,
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
    if (this.state.requestJoinList) {
      if (this.state.page <= this.state.total && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.total) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let requestForm = new FormData();
          requestForm.append(
            'group_id',
            this.state.groupDetails === undefined
              ? this.props.route.params.group_id
              : this.state.groupDetails,
          );
          let response = await postAPICall(
            API.userJoinRequest + '?page=' + page,
            requestForm,
          );
          if (response.data) {
            let data = [...this.state.requestJoinList, ...response.data];
            this.setState({
              requestJoinList: data,
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
  render() {
    const {requestJoinList, loadding} = this.state;
    return (
      <ScreenContainer>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />
        <HeaderView title={getLocalText('GroupInfo.join')} {...this.props} />
        <FlatList
          data={requestJoinList}
          extraData={this.state}
          keyExtractor={(_, index) => index.toString()}
          renderItem={this.renderGroupJoinList}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
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
                loadding,
                getLocalText('ErrorMsgs.emptyList'),
              )}
            </View>
          )}
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
    padding: scale(2),
    borderRadius: scale(28),
  },
  userPic: {
    height: scale(50),
    width: scale(50),
    resizeMode: 'cover',
    borderRadius: scale(25),
    zIndex: 11,
  },
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  blockmain: {
    paddingHorizontal: scale(23),
    paddingBottom: scale(10),
    paddingTop: scale(15),
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
  loaddingCon: {
    height: theme.SCREENHEIGHT * 0.75,
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
  },
});
const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  return {userData};
};
export default connect(mapStateToProps)(RequrestJoinGroup);
