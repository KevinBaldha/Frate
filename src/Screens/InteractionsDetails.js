import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
  TextInput,
  RefreshControl,
} from 'react-native';
import {connect} from 'react-redux';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Entypo';
import Share from 'react-native-share';
import EmojiBoard from './EmojiBoard';
import {
  ScreenContainer,
  SearchBar1,
  BackgroundChunk,
  PostCard,
  Loader,
  OfflineModel,
} from '../Components';
import {getLocalText} from '../Locales/I18n';
import {
  postLikeShareSave,
  postCommentSend,
  commentLike,
} from '../Redux/Actions';
import {Config, scale, theme, images} from '../Utils';
import {API, baseUrlForShare, getAPICall} from '../Utils/appApi';
import {SCREEN_TYPE} from '../Utils/StaticData';

class InteractionsDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      isFilterModal: false,
      interactionDetail: [],
      isEmojiKeyboard: false,
      loadding: false,
      commenttxt: '',
    };
  }
  componentDidMount() {
    this.getInteractionDetails();
  }

  handleRefresh = () => {
    this.getInteractionDetails();
  };

  getInteractionDetails = async () => {
    try {
      this.setState({loadding: true});
      let response = await getAPICall(
        API.intractionDetails + this.props.route.params.postId,
      );
      if (response.error) {
        this.setState({loadding: false});
      } else {
        if (response.success) {
          let data = response.data;
          await this.setState({interactionDetail: [data], loadding: false});
          await this.onCommentPress();
        }
      }
    } catch (error) {}
  };
  //get All save Posts
  getinteractionDetail = async () => {
    try {
      let response = await getAPICall(
        API.intractionDetails + this.props.route.params.postId,
      );
      if (response.error) {
        this.setState({loadding: false});
      } else {
        if (response.success) {
          let data = response.data;
          await this.setState({interactionDetail: [data]});
          await this.onCommentPress();
        }
      }
    } catch (error) {}
  };

  handleImagesView = (item, index) => {
    this.setState({
      imagesView: !this.state.imagesView,
      postDetails: {...item, index: index},
    });
  };
  // like post
  onLikePress = (item, index) => {
    try {
      this.props.postLikeShareSave(item?.id, 'like');
      if (this.props.isPostLike) {
        this.getinteractionDetail();
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  //open comment view
  onCommentPress = (item, index) => {
    this.state.interactionDetail[0].commentOpen =
      !this.state.interactionDetail[0].commentOpen;
    this.setState({interactionDetail: this.state.interactionDetail});
  };
  handleImagesClose = () => {
    this.setState({imagesView: false});
  };
  //send comment on post
  sendComment = (item, index) => {
    try {
      this.props.postCommentSend(
        item?.id,
        this.state.commenttxt,
        this.props.userData.id,
      );
      setTimeout(() => {
        this.getinteractionDetail();
      }, 1100);
    } catch (error) {
      this.setState({loadding: false});
    }
    this.setState({
      commenttxt: '',
      searchText: '',
    });
    Keyboard.dismiss();
  };

  //share post
  onShare = async (item, index) => {
    Share.open({url: baseUrlForShare + item?.item?.id});
    try {
      await this.props.postLikeShareSave(item?.item?.id, 'share');
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  handleCommentTxt = (text) => {
    this.setState({commenttxt: text});
  };

  setEmoji = (emoji) => {
    this.setState({commenttxt: this.state.commenttxt + emoji.code});
  };
  handleEmojiKeboard = () => {
    this.setState({isEmojiKeyboard: !this.state.isEmojiKeyboard});
  };

  safeEmojiBackspace = (str) => {
    let initialRealCount = this.fancyCount(str);
    while (str.length > 0 && this.fancyCount(str) !== initialRealCount - 1) {
      str = str.substring(0, str.length - 1);
    }
    return str;
  };
  fancyCount = (str) => {
    const joiner = '\u{200D}';
    const split = str.split(joiner);
    let count = 0;
    for (const s of split) {
      //removing the variation selectors
      const num = Array.from(s.split(/[\ufe00-\ufe0f]/).join('')).length;
      count += num;
    }
    //assuming the joiners are used appropriately
    return count / split.length;
  };
  redirectToUserDetails = async (item) => {
    this.props.navigation.navigate('UserDataSpecific', {
      data: item,
      id: item,
      screenName: SCREEN_TYPE.NEW_USER,
    });
  };
  renderPost = ({item, index}) => {
    return (
      <View style={{paddingVertical: scale(10)}}>
        <PostCard
          item={item}
          index={index}
          {...this.state}
          onLikePress={this.onLikePress}
          onCommentPress={this.onCommentPress}
          emojiKeyboard={this.handleEmojiKeboard}
          onPressKeyboard={() => this.setState({isEmojiKeyboard: false})}
          onPressSend={this.sendComment}
          openImageView={this.handleImagesView}
          onSharePress={this.onShare}
          flatListScroll={this.state.scrollFlat}
          userImg={
            !this.props.userData ||
            this.props.userData?.user_pic?.original === undefined
              ? ''
              : this.props.userData?.user_pic?.original
          }
          InteractionsDetails={true}
          counterShow={true}
          onPressProfile={() => this.onPressProfile(item)}
          onPressGroup={() => this.onPressGroup(item)}
          userData={this.props.userData}
          onPressSharePost={this.onPressProfile}
        />

        <View style={[styles.commentCon, styles.shadow]}>
          <View style={styles.topView}>
            <FastImage
              source={
                this.props.userData?.user_pic?.original
                  ? {
                      uri: this.props.userData?.user_pic?.original,
                    }
                  : images.AppLogo
              }
              style={styles.userImage}
            />
            <TextInput
              style={styles.input}
              placeholder={getLocalText('Post.writehere')}
              placeholderTextColor={theme.colors.grey7}
              onChangeText={(text) => {
                this.handleCommentTxt(text);
              }}
              value={this.state.commenttxt}
              textAlignVertical={'center'}
            />
            {!this.state.isEmojiKeyboard ? (
              <TouchableOpacity onPress={this.handleEmojiKeboard}>
                <Icon
                  name={'smile'}
                  color={theme.colors.grey6}
                  size={scale(20)}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={this.handleEmojiKeboard}>
                <Icon1
                  name={'keyboard'}
                  color={theme.colors.grey6}
                  size={scale(20)}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => this.sendComment(item, index)}>
              <Icon
                name={'send'}
                size={scale(20)}
                color={
                  this.state.searchText === ''
                    ? theme.colors.grey6
                    : theme.colors.blue
                }
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };
  onPressProfile = (item) => {
    this.redirectToUserDetails(item);
  };

  onPressGroup = (item) => {
    const {navigation} = this.props;
    navigation.navigate('GroupDetails', {
      item: {groupData: item?.group, joined: true},
    });
  };
  render() {
    const {interactionDetail, loadding} = this.state;
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
          ref={(ref) => (this.FlatListRef = ref)}
          contentContainerStyle={{
            paddingVertical: scale(10),
            paddingTop: scale(30),
          }}
          style={{marginBottom: scale(10)}}
          keyExtractor={(item, index) => index.toString()}
          data={interactionDetail}
          extraData={[this.state, this.props]}
          renderItem={this.renderPost}
          onScroll={(e) => {
            this.setState({scrollFlat: e.nativeEvent.contentOffset.y});
            this.setState({isEmojiKeyboard: false});
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loadding}
              onRefresh={() => this.handleRefresh()}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.loaddingCon}>
              {Config.NO_DATA_COMPO(loadding)}
            </View>
          )}
        />
        {this.state.loadding && <Loader loading={this.state.loadding} />}
        <EmojiBoard
          showBoard={this.state.isEmojiKeyboard}
          onClick={this.setEmoji}
          onRemove={() => {
            var newText = this.safeEmojiBackspace(this.state.commenttxt);
            this.setState({commenttxt: newText});
          }}
          onClose={() => this.setState({isEmojiKeyboard: false})}
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
    right: -(theme.SCREENHEIGHT * 0.39),
    transform: [{rotate: '75deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.47),
    left: -(theme.SCREENHEIGHT * 0.36),
    transform: [{rotate: '75deg'}],
  },
  name: {
    fontFamily: theme.fonts.muktaMedium,
    fontSize: scale(11),
  },
  commentCon: {
    borderRadius: scale(30),
    backgroundColor: theme.colors.white,
    marginHorizontal: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: scale(10),
    marginTop: scale(15),
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {flexDirection: 'row'},
  userImage: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
  },
  shadow: {
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 1.4,
    elevation: 1,
  },
  input: {
    width: '65%',
    textAlignVertical: 'center',
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    color: theme.colors.black,
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
  },
});
const mapStateToProps = (state) => {
  const userData = state.UserInfo.data;
  const isPostLike = state.PostReducer.postLike;
  return {userData, isPostLike};
};
export default connect(mapStateToProps, {
  postLikeShareSave,
  postCommentSend,
  commentLike,
})(InteractionsDetails);
