import React, {Component} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Share from 'react-native-share';
// import EmojiBoard from './EmojiBoard';
import {connect} from 'react-redux';
import {
  PostCard,
  Loader,
  SearchBar1,
  PostOptions,
  OfflineModel,
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
class BlockedContent extends Component {
  constructor(props) {
    super(props);
    this.apiService = new Api();
    this.state = {
      userInfo: '',
      blockPost: [],
      imagesView: false,
      postDetails: '',
      loadding: false,
      commenttxt: '',
      searchText: '',
      handleOption: false,
      options: [{icon: 'eye', name: getLocalText('Timeline.unhide')}],
      postOptionIndex: '',
      isEmojiKeyboard: false,
      postOption: '',
      refreshing: false,
      totalPage: 1,
      page: 1,
      loadmore: false,
    };
  }

  componentDidMount() {
    this.getBlockPost();
  }
  //get All save Posts
  getBlockPost = async () => {
    this.setState({userInfo: this.props.userData});
    try {
      this.setState({loadding: true});
      let response = await getAPICall(API.getHidePost);
      if (response.success) {
        this.setState({
          blockPost: response.data,
          loadding: false,
          totalPage: response.total_page,
        });
      } else {
        this.setState({loadding: false});
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  getUpdateBlockPost = async () => {
    try {
      let response = await getAPICall(API.getHidePost);

      if (response.success) {
        this.setState({
          blockPost: response.data,
          totalPage: response.total_page,
        });
      } else {
        this.setState({loadding: false});
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  handleOptions = async (index, item) => {
    this.postOptionClose();
    if (index === 0) {
      try {
        let postIndex = this.state.postOptionIndex;
        await this.props.postLikeShareSave(item, 'hide');
        this.state.blockPost.splice(postIndex, 1);
        this.setState({blockPost: this.state.blockPost});
      } catch (error) {
        this.setState({loadding: false});
      }
    }
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

  handlePostModal = (item, index, evt) => {
    this.setState({
      postOption: item?.id,
      postOptionIndex: this.state.postOptionIndex === index ? '' : index,
      indicatorOffset: evt.nativeEvent.pageY,
      handleOption: !this.state.handleOption,
    });
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
  // like post
  onLikePress = (item, index) => {
    try {
      this.props.postLikeShareSave(item?.id, 'like');
      if (this.props.isPostLike) {
        this.state.blockPost[index].is_like =
          !this.state.blockPost[index].is_like;

        this.setState({blockPost: this.state.blockPost});

        if (this.state.blockPost[index].is_like) {
          this.state.blockPost[index].total_like =
            this.state.blockPost[index].total_like + 1;
          this.setState({blockPost: this.state.blockPost});
        } else {
          this.state.blockPost[index].total_like =
            this.state.blockPost[index].total_like - 1;
          this.setState({blockPost: this.state.blockPost});
        }
      }
    } catch (error) {
      this.setState({loadding: false});
    }
  };
  //open comment view
  onCommentPress = (item, index) => {
    this.state.blockPost[index].commentOpen =
      !this.state.blockPost[index].commentOpen;
    this.setState({blockPost: this.state.blockPost});
  };
  handleImagesClose = () => {
    this.setState({imagesView: false});
  };
  //send comment on post
  sendComment = (item, index) => {
    try {
      this.props.postCommentSend(item?.id, this.state.commenttxt);
      setTimeout(() => {
        this.getUpdateBlockPost();
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
    this.setState({blockPost: this.state.blockPost});
  };

  handleEmojiKeboard = () => {
    this.setState({isEmojiKeyboard: !this.state.isEmojiKeyboard});
  };
  commentLikePress = (item, index) => {
    try {
      this.props.commentLike(item);
      setTimeout(() => {
        setTimeout(() => {
          this.state.blockPost[index].comments[0].is_like =
            !this.state.blockPost[index].comments[0].is_like;
          this.setState({blockPost: this.state.blockPost});
        }, 300);
      }, 1200);
    } catch (error) {
      this.setState({loadding: false});
    }
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
          onLikePress={this.onLikePress}
          onCommentPress={this.onCommentPress}
          onPressSend={this.sendComment}
          onChangeText={text => {
            this.handleCommentTxt(text, item);
          }}
          onPressEmoji={this.handleEmojiKeboard}
          onPressKeyboard={() => this.setState({isEmojiKeyboard: false})}
          value={this.state.commenttxt}
          openImageView={this.handleImagesView}
          onSharePress={this.onShare}
          onPressCommentLike={this.commentLikePress}
          flatListScroll={this.state.scrollFlat}
          userImg={
            !this.props.userData ||
            this.props?.userData?.user_pic?.original === undefined
              ? ''
              : this.props?.userData?.user_pic?.original
          }
          bookmark={true}
          optionsIconColor={this.state.handleOption}
          // handleOptions={this.handleOptions}
          showOption={true}
          postId={this.state.postOption}
          handlePostModal={this.handlePostModal}
          onPressProfile={this.onPressProfile}
          onPressGroup={this.onPressGroup}
          updateCommentCount={this.updateCommentCount}
          userData={this.props?.userData}
          onPressSharePost={this.onPressProfile}
        />
      </View>
    );
  };
  updateCommentCount = index => {
    this.state.blockPost[index].total_comment =
      this.state.blockPost[index].total_comment + 1;
    this.setState({blockPost: this.state.blockPost});
  };
  onPressProfile = () => {};
  onPressGroup = () => {};
  handleRefresh = async () => {
    this.setState({refreshing: true, page: 1});
    let blockPosts = await getAPICall(API.getHidePost);
    if (blockPosts.success) {
      await this.setState({
        blockPost: blockPosts.data,
        refreshing: false,
      });
    } else {
      this.setState({refreshing: false});
    }
  };
  //load next page posts
  loadMore = async () => {
    if (this.state.blockPost) {
      if (this.state.page <= this.state.totalPage && !loadMoreData) {
        let page = this.state.page + 1;
        if (page < this.state.totalPage) {
          this.setState({loadmore: true});
          loadMoreData = true;
          let blockposts = await getAPICall(API.getHidePost + '?page=' + page);
          let data = [...this.state.blockPost, ...blockposts.data];
          if (blockposts.success) {
            this.setState({
              blockPost: data,
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
  notificationPress = async () => {
    this.props.navigation.navigate('Notification');
  };
  render() {
    const {blockPost, loadding} = this.state;
    return (
      <View
        style={styles.flex}
        onStartShouldSetResponder={event => {
          this.handleOptions();
        }}>
        <SearchBar1
          {...this.props}
          title={getLocalText('UserData.block')}
          onNotificationPress={() => {
            this.notificationPress();
          }}
          searchText={this.state.searchText}
          onSearchText={txt => this.setState({searchText: txt})}
        />
        <FlatList
          ref={ref => (this.FlatListRef = ref)}
          contentContainerStyle={{
            paddingVertical: scale(10),
            paddingTop: scale(30),
          }}
          style={{marginBottom: scale(20)}}
          keyExtractor={(item, index) => item?.id.toString()}
          data={blockPost}
          extraData={[this.state, this.props]}
          renderItem={this.renderPost}
          onScroll={e => {
            this.setState({
              scrollFlat: e.nativeEvent.contentOffset.y,
              isEmojiKeyboard: false,
            });
            this.state.postOption ? this.postOptionClose() : '';
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
              {Config.NO_DATA_COMPO(loadding)}
            </View>
          )}
        />
        {this.state.postOptionIndex !== '' &&
        this.state.postOption ===
          this.state.blockPost[this.state.postOptionIndex].id ? (
          <PostOptions
            {...this.props}
            {...this.state}
            item={this.state.blockPost[this.state.postOptionIndex].id}
            data={this.state.blockPost[this.state.postOptionIndex]}
            isSponsored={
              this.state.blockPost[this.state.postOptionIndex].is_sponsored
            }
            handleOptions={this.handleOptions}
            is_sponsoredHiden={true}
            singleOption={true}
          />
        ) : null}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    height: theme.SCREENHEIGHT * 0.7,
    flex: 1,
  },
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
})(BlockedContent);
