import React, {Component} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Share from 'react-native-share';
import {connect} from 'react-redux';
// import EmojiBoard from './EmojiBoard';
import {
  ScreenContainer,
  PostCard,
  ImagesViewModel,
  Loader,
  BackgroundChunk,
  PostOptions,
  OfflineModel,
  HeaderView,
} from '../Components';
import {theme, scale, Config, Api} from '../Utils';
import {API, baseUrlForShare, getAPICall} from '../Utils/appApi';
import {
  postLikeShareSave,
  postCommentSend,
  commentLike,
} from '../Redux/Actions';
import {getLocalText} from '../Locales/I18n';
import EmojiPicker from 'rn-emoji-keyboard';

let loadMoreData = false;
class SavePost extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      userInfo: '',
      savePost: [],
      totalPage: 1,
      page: 1,
      imagesView: false,
      postDetails: '',
      loadding: false,
      commenttxt: '',
      searchText: '',
      handleOption: false,
      options: [{icon: 'save', name: getLocalText('Timeline.unsave')}],
      postOptionIndex: '',
      isEmojiKeyboard: false,
      loadmore: false,
      refreshing: false,
      isFromSavePost: true,
    };
  }

  componentDidMount() {
    this.getSavedPost();
  }
  //get All save Posts
  getSavedPost = async () => {
    this.setState({userInfo: this.props.userData});
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.getSavePost);
      console.log('getSavedPost response ->',response);
      
      this.setState({loadding: false});
      if (response.success) {
        this.setState({
          savePost: response.data,
          totalPage: response.total_page,
        });
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  getUpdateSavedPost = async () => {
    try {
      let response = await getAPICall(API.getSavePost);
      if (response.success) {
        this.setState({
          savePost: response.data,
          totalPage: response.total_page,
        });
      } else {
        this.setState({loadding: false});
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };

  commentLikePress = (item, index) => {
    try {
      this.props.commentLike(item);
      setTimeout(() => {
        this.state.savePost[index].comments[0].is_like =
          !this.state.savePost[index].comments[0].is_like;
        this.setState({savePost: this.state.savePost});
      }, 300);
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  // like post
  onLikePress = async (item, index) => {
    try {
      await this.props.postLikeShareSave(item?.id, 'like');

      if (this.props.isPostLike) {
        this.getUpdateSavedPost();
        this.state.savePost[index].is_like =
          !this.state.savePost[index].is_like;

        this.setState({savePost: this.state.savePost});

        if (this.state.savePost[index].is_like) {
          this.state.savePost[index].total_like =
            this.state.savePost[index].total_like + 1;
          this.setState({savePost: this.state.savePost});
        } else {
          this.state.savePost[index].total_like =
            this.state.savePost[index].total_like - 1;
          this.setState({savePost: this.state.savePost});
        }
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  //open comment view
  onCommentPress = (item, index) => {
    this.state.savePost[index].commentOpen =
      !this.state.savePost[index].commentOpen;
    this.setState({savePost: this.state.savePost});
  };
  handleImagesClose = () => {
    this.setState({imagesView: false});
  };

  safeEmojiBackspace = str => {
    let initialRealCount = this.fancyCount(str);
    while (str.length > 0 && this.fancyCount(str) !== initialRealCount - 1) {
      str = str.substring(0, str.length - 1);
    }
    return str;
  };
  fancyCount = str => {
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
  //send comment on post
  sendComment = (item, index) => {
    try {
      this.props.postCommentSend(item?.id, this.state.commenttxt);
      setTimeout(() => {
        this.getUpdateSavedPost();
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
  //handle image view
  handleImagesView = (item, index) => {
    this.setState({
      imagesView: !this.state.imagesView,
      postDetails: {...item, index: index},
    });
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

  handleCommentTxt = (text, data) => {
    data.commentTxt = text;
    this.setState({savePost: this.state.savePost});
  };

  handleEmojiKeboard = () => {
    this.setState({isEmojiKeyboard: !this.state.isEmojiKeyboard});
  };
  //handle save post
  handleSave = async item => {
    try {
      let postIndex = this.state.postOptionIndex;
      await this.props.postLikeShareSave(item, 'save');
      this.state.savePost.splice(postIndex, 1);
      this.setState({savePost: this.state.savePost});
    } catch (error) {}
  };

  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };

  handleMsgPopUp = async item => {
    const {userData, navigation} = this.props;
    const userID = item?.user_id;
    if (userID !== userData?.id) {
      let chatResponse = await getAPICall(API.chat + userID);
      navigation.navigate('Chat', {
        data: chatResponse?.data,
        singleChat: '1',
      });
    }
  };

  // post reaction modal
  handlePressLike = async (item, index, evt) => {
    this.setState({
      postLikeOption: item?.id,
      indicatorOffsetForLike: evt.nativeEvent.pageY,
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
          onPressSend={this.sendComment}
          onPressEmoji={this.handleEmojiKeboard}
          onPressKeyboard={() => this.setState({isEmojiKeyboard: false})}
          onChangeText={text => {
            this.handleCommentTxt(text, item);
          }}
          optionsIconColor={this.state.handleOption}
          // handleOptions={this.handleOptions}
          value={this.state.commenttxt}
          openImageView={this.handleImagesView}
          onSharePress={this.onShare}
          flatListScroll={this.state.scrollFlat}
          handleMsgPopUp={this.handleMsgPopUp}
          userImg={
            !this?.props?.userData ||
            this?.props?.userData?.user_pic?.original === undefined
              ? ''
              : this.props?.userData?.user_pic?.original
          }
          postId={this.state.postOption}
          onPressCommentLike={this.commentLikePress}
          showOption={true}
          bookmark={true}
          handlePostModal={this.handlePostModal}
          handlePostLike={this.handlePressLike}
          onPressProfile={this.onPressProfile}
          onPressGroup={() => this.onPressGroup(item)}
          updateCommentCount={this.updateCommentCount}
          userData={this.props.userData}
          onPressSharePost={this.onPressProfile}
        />
      </View>
    );
  };

  updateCommentCount = index => {
    this.state.savePost[index].total_comment =
      this.state.savePost[index].total_comment + 1;
    this.setState({savePost: this.state.savePost});
  };
  onPressProfile = () => {};
  onPressGroup = item => {
    const {navigation} = this.props;
    navigation.navigate('GroupDetails', {
      item: {groupData: item?.group, joined: true},
    });
  };
  handleOptions = async (index, item) => {
    this.postOptionClose();
    if (index === 0) {
      this.handleSave(item);
    } else if (index === -2) {
      this.props.navigation.push('Statistics', {
        data: this.state.savePost[this.state.postOptionIndex],
      });
    }
  };
  postOptionClose = () => {
    this.setState({
      postOption: '',
      postOptionIndex: '',
      handleOption: !this.state.handleOption,
    });
  };
  setEmoji = emoji => {
    this.setState({commenttxt: this.state.commenttxt + emoji.emoji});
  };
  handlePostModal = (item, index, evt) => {
    this.setState({
      postOption: item?.id,
      postOptionIndex: this.state.postOptionIndex === index ? '' : index,
      indicatorOffset: evt.nativeEvent.pageY,
      handleOption: !this.state.handleOption,
    });
  };

  //load next page posts
  loadMore = async () => {
    if (this.state.savePost) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;

          let savePosts = await getAPICall(API.getSavePost + '?page=' + page);
          let data = await [...this.state.savePost, ...savePosts.data];
          if (savePosts.success) {
            this.setState({
              savePost: data,
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
    let savePosts = await getAPICall(API.getSavePost);
    if (savePosts.success) {
      await this.setState({
        savePost: savePosts.data,
        refreshing: false,
      });
    } else {
      this.setState({refreshing: false});
    }
  };

  render() {
    const {savePost, loadding} = this.state;
    return (
      <ScreenContainer style={styles.flex}>
        <BackgroundChunk style={styles.topImage} />
        <BackgroundChunk style={styles.bottomImage} />

        <HeaderView {...this.props} title={getLocalText('Settings.savepost')} />

        <FlatList
          ref={ref => (this.FlatListRef = ref)}
          contentContainerStyle={{
            paddingVertical: scale(10),
            paddingTop: scale(30),
          }}
          style={{marginVertical: scale(10)}}
          keyExtractor={(item, index) => item?.id.toString()}
          data={savePost}
          extraData={[this.state, this.props]}
          renderItem={this.renderPost}
          onScroll={e => {
            this.setState({scrollFlat: e.nativeEvent.contentOffset.y});
            this.state.postOption ? this.postOptionClose() : '';
            this.setState({
              isEmojiKeyboard: false,
            });
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
          ListFooterComponent={this.renderFooter.bind(this)}
          onEndReachedThreshold={0.3}
          onEndReached={this.loadMore}
          ListEmptyComponent={() => (
            <View style={styles.loaddingCon}>
              {Config.NO_DATA_COMPO(
                loadding,
                getLocalText('ErrorMsgs.savePostEmptyList'),
              )}
            </View>
          )}
        />
        {this.state.postOptionIndex !== '' &&
        this.state.postOption ===
          this.state.savePost[this.state.postOptionIndex].id ? (
          <PostOptions
            {...this.props}
            {...this.state}
            item={this.state.savePost[this.state.postOptionIndex].id}
            data={this.state.savePost[this.state.postOptionIndex]}
            handleOptions={this.handleOptions}
            is_sponsoredHiden={true}
            singleOption={true}
          />
        ) : null}
        <ImagesViewModel
          {...this.props}
          item={this.state.postDetails}
          isVisible={this.state.imagesView}
          close={this.handleImagesClose}
          user={this.props.userData}
          handleRefresh={this.getSavedPost}
          onPressLike={this.onLikePress}
        />
        {/* unused */}
        <EmojiPicker
          onEmojiSelected={this.setEmoji}
          open={this.state.isEmojiKeyboard}
          onClose={() => this.setState({isEmojiKeyboard: false})}
        />
        {/* <EmojiBoard
          showBoard={this.state.isEmojiKeyboard}
          onClick={this.setEmoji}
          onRemove={() => {
            var newText = this.safeEmojiBackspace(this.state.commenttxt);
            this.setState({commenttxt: newText});
          }}
          onClose={() => this.setState({isEmojiKeyboard: false})}
        /> */}
        <Loader loading={loadding} />
        <OfflineModel />
      </ScreenContainer>
    );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
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
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT * 0.75,
  },
  emptyList: {fontSize: 20, color: 'black', alignSelf: 'center'},
});

const mapStateToProps = state => {
  const userData = state.UserInfo.data;
  const isPostLike = state.PostReducer.postLike;
  return {userData, isPostLike};
};
export default connect(mapStateToProps, {
  postLikeShareSave,
  postCommentSend,
  commentLike,
})(SavePost);
