import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
  FlatList,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Modal from 'react-native-modal';
import Swipeout from 'react-native-swipeout';
import FastImage from 'react-native-fast-image';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import Icon1 from 'react-native-vector-icons/Entypo';
import {Config, scale, theme, height} from '../../Utils';
import {
  Label,
  BackgroundChunk,
  ConfirmationModel,
  Loader,
  CommentBox,
  HeaderView,
} from '../index';
import {API, getAPICall} from '../../Utils/appApi';
import EmojiBoard from '../../Screens/EmojiBoard';
import {getLocalText} from '../../Locales/I18n';
import {commentLike, postCommentSend} from '../../Redux/Actions';
let loadMoreData = false;

const PostsCommentModel = (props) => {
  const {
    isVisible,
    close,
    data,
    userImg,
    InteractionsDetails,
    index,
    updateCommentCount,
    reportReasonList,
    timeline,
  } = props;
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loadmore, setLoadmore] = useState(false);
  const [confrim, setConfrim] = useState(false);
  const [comments, setCommens] = useState([]);
  const [scomment, setScommen] = useState(null);
  const [sindex, setIndex] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [emjoi, setEmoji] = useState(false);
  const [loadding, setLoadding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [perPageData, setPerPageData] = useState(0);
  const [swipClose, setSwipClose] = useState(true);
  const ref_input = useRef();
  const dispatch = useDispatch();
  const [previousIndexClick, setPreviousIndexClick] = useState(-1);

  const {getData} = useSelector((state) => state.PostReducer);
  useEffect(() => {
    if (isVisible) {
      setLoadding(true);
      getComment();
    }
  }, [isVisible]);

  //get comment list
  const getComment = async () => {
    setPage(1);
    let response = await getAPICall(API.getComments + data.id + '?page=1');
    setLoadding(false);
    setRefreshing(false);
    if (response.success) {
      setCommens(response?.data.reverse());
      setTotalPage(response?.total_page);
      setPerPageData(response?.per_page_data);
      setPage(1);
    }
  };

  //comment like
  const onPressCommentLike = async (item, comment_index) => {
    try {
      var commentsIndex = comments.findIndex((d) => d.id === item?.id);
      comments[commentsIndex].is_like = !comments[commentsIndex].is_like;
      setCommens(comments);
      dispatch(commentLike(item?.id));

      // update post list in timeline
      if (timeline) {
        const postData = getData;
        const postIndex = postData.data.findIndex((d) => d.id === data.id);
        postData.data[postIndex].comments = comments;
        this.props.getPostLocally(postData);
      }
    } catch (error) {}
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    getComment();
  };

  //delete post
  const handleDelete = async (action) => {
    setConfrim(false);
    if (action === 1) {
      setSwipClose(true);
      try {
        setLoadding(true);
        let deleteComment = await getAPICall(
          API.deletePostComment + scomment.id,
        );
        setLoadding(false);
        if (deleteComment.success) {
          const newCommentsData = [...comments];
          newCommentsData.splice(sindex, 1);
          setCommens(newCommentsData);

          // update redux post data list
          if (timeline) {
            const postData = getData;
            const postIndex = postData.data.findIndex((d) => d.id === data.id);
            postData.data[postIndex].comments = newCommentsData;
            postData.data[postIndex].total_comment =
              postData.data[postIndex].comments.length;
            this.props.getPostLocally(postData);
          }
        }
      } catch (error) {
        setLoadding(false);
      }
    }
  };

  const swipeItem = (item, ind) => {
    setScommen(item);
    setIndex(ind);
    setConfrim(true);
  };

  const onPressEmoji = () => {
    setEmoji(true);
  };

  const onPressKeybord = () => {
    ref_input.current.focus();
    setEmoji(false);
  };

  const setEmojiBord = (emoji) => {
    setCommentText(commentText + emoji.code);
  };

  //load next  posts commnents
  const loadMore = async () => {
    let postId = data.id;
    if (comments) {
      if (page <= totalPage && !loadMoreData) {
        var nextPage = page + 1;
        if (nextPage < totalPage) {
          setLoadmore(true);
          loadMoreData = true;
          let comRes = await getAPICall(
            API.getComments + postId + '?page=' + nextPage,
          );
          setPage(nextPage);
          if (comRes.success) {
            let commentStore = [...comRes.data.reverse(), ...comments];
            setCommens(commentStore);
            setLoadmore(false);
            loadMoreData = false;
          }
        }
      } else {
        setLoadmore(false);
      }
    }
  };

  const updatePostsList = (postId, commentdata) => {
    // update redux post list
    const postData = getData;
    const postIndex = postData.data.findIndex((d) => d.id === postId);
    postData.data[postIndex].comments = [
      commentdata,
      ...postData.data[postIndex].comments,
    ];
    this.props.getPostLocally(postData);
  };

  //sed comment
  const postComment = async () => {
    let postId = data.id;
    if (commentText) {
      try {
        setLoadding(true);
        const commentdata = await dispatch(
          postCommentSend(postId, commentText, index),
        );
        let commentsData = [...comments, commentdata.data];
        setCommens(commentsData);
        setTotalPage(Math.ceil(commentdata.length / perPageData));
        updateCommentCount(index);
        // update redux post list
        if (timeline) {
          updatePostsList(postId, commentdata.data);
        }
        setLoadding(false);
      } catch (error) {
        setLoadding(false);
      }
      setCommentText('');
      setEmoji(false);
      Keyboard.dismiss();
    }
  };

  const safeEmojiBackspace = (str) => {
    let initialRealCount = fancyCount(str);
    while (str.length > 0 && fancyCount(str) !== initialRealCount - 1) {
      str = str.substring(0, str.length - 1);
    }
    return str;
  };

  const fancyCount = (str) => {
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

  const renderFooter = () => {
    if (!loadmore) {
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

  const renderComment = ({item, index}) => {
    var swipeoutBtns = [
      {
        component: (
          <TouchableOpacity
            style={styles.btndelete}
            onPress={() => {
              swipeItem(item, index);
            }}>
            <Label title="Delete" style={{color: theme.colors.white}} />
          </TouchableOpacity>
        ),

        backgroundColor: theme.colors.white,
        width: 25,
      },
    ];
    return (
      <Swipeout
        right={swipeoutBtns}
        autoClose={true}
        close={swipClose}
        backgroundColor={theme.colors.transparent}>
        <CommentBox
          item={item}
          index={index}
          onPressCommentLike={onPressCommentLike}
          InteractionsDetails={InteractionsDetails}
          updateCom={handleRefresh}
          reportReasonList={reportReasonList}
          onClose={true}
          setPreviosIndexClick={(i) => setPreviousIndexClick(i)}
          previousIndexClick={previousIndexClick}
        />
      </Swipeout>
    );
  };

  return (
    <Modal
      onBackButtonPress={close}
      avoidKeyboard
      isVisible={isVisible}
      backdropColor={theme.colors.darkBlue}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      onSwipeComplete={close}
      swipeThreshold={25}
      style={{margin: scale(0)}}
      backdropOpacity={0}>
      <View style={[styles.container]}>
        <HeaderView
          backPress
          backPressHandle={close}
          title={getLocalText('Post.comment')}
          color={theme.colors.grey10}
        />
        <KeyboardAvoidingView
          enabled
          keyboardShouldPersistTaps="handled"
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? scale(0) : scale(0)}>
          <Loader loading={loadding} />
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={comments}
            inverted={-1}
            extraData={[comments, props]}
            keyExtractor={(_, ind) => ind.toString()}
            renderItem={renderComment}
            contentContainerStyle={styles.commentView}
            style={{
              height: theme.SCREENHEIGHT * 0.85,
            }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter.bind(this)}
            onEndReachedThreshold={0.3}
            onEndReached={loadMore}
            ListEmptyComponent={() => (
              <View style={styles.loaddingCon}>
                <BackgroundChunk style={styles.topImage} />
                <BackgroundChunk style={styles.bottomImage} />
                {Config.NO_DATA_COMPO(
                  !loadding && comments.length === 0
                    ? getLocalText('Post.noComment')
                    : '',
                )}
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => handleRefresh()}
              />
            }
            onScroll={(e) => {
              setEmoji(false);
            }}
            onScrollBeginDrag={() => {
              setEmoji(false);
            }}
          />
          <View
            style={[
              styles.bottomView,
              {
                bottom: emjoi
                  ? Platform.OS === 'android'
                    ? theme.SCREENHEIGHT * 0.3
                    : scale(230)
                  : scale(8),
              },
            ]}>
            <View style={[styles.commentCon, styles.shadow]}>
              <View style={styles.topView}>
                <FastImage source={{uri: userImg}} style={styles.userImage} />
                <TextInput
                  ref={ref_input}
                  style={styles.input}
                  placeholder={getLocalText('Post.writehere')}
                  placeholderTextColor={theme.colors.grey7}
                  value={commentText}
                  onChangeText={(txt) => {
                    setCommentText(txt);
                  }}
                  returnKeyType="send"
                  textAlignVertical={'center'}
                  onSubmitEditing={() => {
                    postComment();
                  }}
                />
                {emjoi ? (
                  <TouchableOpacity
                    onPress={() => {
                      onPressKeybord();
                    }}>
                    <Icon1
                      name={'keyboard'}
                      color={theme.colors.grey6}
                      size={scale(20)}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={onPressEmoji}>
                    <Icon
                      name={'smile'}
                      color={theme.colors.grey6}
                      size={scale(20)}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  disabled={commentText.trim() === '' ? true : false}
                  onPress={() => postComment()}>
                  <Icon
                    name={'send'}
                    size={scale(20)}
                    color={
                      commentText.trim() === ''
                        ? theme.colors.grey6
                        : theme.colors.blue
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
      <EmojiBoard
        showBoard={emjoi}
        onClick={setEmojiBord}
        onRemove={() => {
          var str = safeEmojiBackspace(commentText);
          setCommentText(str);
        }}
        hideBackSpace={false}
        onClose={() => setEmoji(false)}
      />
      <ConfirmationModel
        isVisible={confrim}
        close={handleDelete}
        type={'comment'}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: '100%',
    height: theme.SCREENHEIGHT,
    flex: 1,
    overflow: 'hidden',
    padding: isIphoneX() ? scale(0) : scale(0),
  },
  commentView: {
    paddingHorizontal: scale(10),
    paddingTop: scale(80),
    overflow: 'hidden',
    flexDirection: 'column-reverse',
    marginBottom: scale(100),
  },
  loaddingCon: {
    justifyContent: 'center',
    alignSelf: 'center',
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT * 0.9,
  },
  topImage: {
    position: 'absolute',
    top: -(theme.SCREENHEIGHT * 0.45),
    right: -(theme.SCREENHEIGHT * 0.4),
    transform: [{rotate: '80deg'}],
  },
  bottomImage: {
    position: 'absolute',
    bottom: -(theme.SCREENHEIGHT * 0.4),
    left: -(theme.SCREENHEIGHT * 0.62),
    transform: [{rotate: '80deg'}],
  },
  bottomView: {
    position: 'absolute',
    bottom: -scale(10),
    height: scale(65),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    zIndex: 10000,
  },
  input: {
    width: '70%',
    textAlignVertical: 'center',
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(14),
    color: theme.colors.black,
    height: scale(45),
  },
  commentCon: {
    borderRadius: scale(30),
    backgroundColor: theme.colors.white,
    marginHorizontal: scale(5),
    paddingHorizontal: scale(10),
    paddingVertical: scale(7),
    marginTop: scale(15),
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
  keyboardView: {
    flex: 1,
    paddingBottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: theme.colors.white1,
  },
  btndelete: {
    backgroundColor: theme.colors.red,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scale(10),
  },
});

export default PostsCommentModel;
