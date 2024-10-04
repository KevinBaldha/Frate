import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Platform,
  FlatList,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Modal from 'react-native-modal';
import EmojiBoard from '../../Screens/EmojiBoard';
import Icon from 'react-native-vector-icons/Feather';
import Share from 'react-native-share';
import {useDispatch} from 'react-redux';
import FastImage from 'react-native-fast-image';
import {commentLike, postCommentSend} from '../../Redux/Actions';
import {scale, theme, height} from '../../Utils';
import {
  PostFooter,
  PostHeader,
  Comment,
  FullImageModel,
  VideoShow,
  Label,
} from '../index';
import {API, baseUrlForShare, getAPICall} from '../../Utils/appApi';

const ImagesViewModel = (props) => {
  const {
    isVisible,
    close,
    item,
    user,
    handleRefresh,
    onPressLike,
    // onPressComment,
    onPressProfile,
    onPressGroup,
  } = props;
  const dispatch = useDispatch();
  const [comment, setComment] = useState(true);
  const [items, setitem] = useState();
  const [commenttxt, setCommenttx] = useState('');
  const [model, setModel] = useState(false);
  const [isPaused, setisPaused] = useState(true);
  const [emoji, setEmojiKey] = useState(false);
  const toggleVideoButton = () => {
    setisPaused(!isPaused);
  };

  //like press
  const onLikePress = (postLike, index) => {
    if (user.id !== item?.user_id) {
      postLike.is_like = !postLike.is_like;
      onPressLike(postLike, index);
    }
  };
  //open comment view
  const onPressComment = () => {
    setComment(!comment);
  };
  //comment like
  const onPressCommentLike = (commentlike, index) => {
    try {
      dispatch(commentLike(commentlike));
      setTimeout(() => {
        item.comments[0].is_like = !item?.comments[0].is_like;
        handleRefresh();
      }, 600);
    } catch (error) {}
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

  //comment send
  const postComment = (commentpost, index) => {
    try {
      dispatch(postCommentSend(commentpost.id, commenttxt));
      setTimeout(() => {
        handleRefresh();
      }, 1500);
    } catch (error) {}
    setCommenttx('');
    setComment(false);
    Keyboard.dismiss();
  };
  const onShare = async (share, index) => {
    Share.open({url: baseUrlForShare + share.item?.id});
  };
  const handleClose = () => {
    setModel(!model);
  };
  const onPressEmoji = () => {
    setEmojiKey(!emoji);
  };
  const handleCommentTxt = (text) => {
    setCommenttx(text);
  };

  const setEmoji = (emojicode) => {
    setCommenttx(commenttxt + emojicode.code);
  };
  const onPressProfileHandle = async (data) => {
    await onPressProfile(data);
    close();
  };
  const onPressGroupHandle = async (data) => {
    await onPressGroup(data);
    close();
  };

  const handleMsgPopUp = async () => {
    const {userData, navigation} = props;
    const userID = item?.user_id;
    if (userID !== userData?.id) {
      let chatResponse = await getAPICall(API.chat + userID);
      navigation.push('Chat', {
        data: chatResponse?.data,
        singleChat: '1',
      });
      close();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      statusBarTranslucent
      deviceHeight={height}
      style={styles.container}
      onBackdropPress={close}
      onBackButtonPress={close}
      backdropOpacity={0}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={close}
          style={{
            marginHorizontal: scale(15),
            marginVertical: Platform.OS === 'android' ? scale(20) : scale(10),
          }}>
          <Icon name="arrow-left" size={scale(25)} color={theme.colors.blue} />
        </TouchableOpacity>
        <ScrollView
          style={styles.scrollCon}
          onScroll={() => {
            setEmojiKey(false);
          }}>
          <View style={styles.postCon}>
            <PostHeader
              item={item}
              showOption={false}
              onPressProfile={onPressProfileHandle}
              onPressGroup={onPressGroupHandle}
            />
            <Label title={item?.details} style={styles.txt} />
            <PostFooter
              {...props}
              item={item}
              index={item?.index}
              onLikePress={onLikePress}
              onPressComment={onPressComment}
              handleMsgPopUp={handleMsgPopUp}
              onSharePress={onShare}
              onPressEmoji={onPressEmoji}
              onPressKeyboard={() => setEmojiKey(false)}
              onLikeLongPress={() => {}}
              emojiKeyboard={emoji}
              bookmark={true}
              commentOpen={comment}
            />
          </View>

          <FlatList
            data={item?.post_attachment}
            contentContainerStyle={styles.listCOntainer}
            renderItem={(itemData, index) => {
              return (
                <View
                  style={{
                    marginVertical: scale(5),
                  }}>
                  {itemData.item?.media_type === 'image' ? (
                    <TouchableOpacity
                      onPress={() => {
                        setModel(true);
                        setitem(index);
                      }}>
                      <FastImage
                        style={styles.imageCon}
                        source={{uri: itemData.item?.uri.optimize}}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  ) : (
                    itemData.item?.media_type === 'video' && (
                      <TouchableOpacity
                        onPress={() => {
                          setModel(true);
                          setitem(index);
                        }}>
                        <VideoShow
                          thumbnail={itemData.item?.thumbnail}
                          videoStyle={{
                            width: theme.SCREENWIDTH,
                            height: theme.SCREENHEIGHT / 2,
                          }}
                          fullScreen
                          url={itemData.item?.uri}
                          isPaused={isPaused}
                          handleMuteVideo={toggleVideoButton}
                          endVideo={toggleVideoButton}
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              );
            }}
          />

          {item?.comments?.length !== 0 && (
            <Comment
              comments={item?.comments}
              userImg={user?.user_pic?.small}
              {...props}
              item={item}
              onPressEmoji={onPressEmoji}
              onPressKeyboard={() => setEmojiKey(false)}
              emojiKeyboard={emoji}
              onChangeText={(text) => {
                handleCommentTxt(text);
              }}
              value={commenttxt}
              color={commenttxt.trim().length > 0 ? false : true}
              onPressSend={postComment}
              onPressCommentLike={onPressCommentLike}
            />
          )}
        </ScrollView>

        <EmojiBoard
          showBoard={emoji}
          onClick={setEmoji}
          onRemove={() => {
            var str = safeEmojiBackspace(commenttxt);
            setCommenttx(str);
          }}
          onClose={() => setEmojiKey(false)}
        />

        <FullImageModel
          isShow={model}
          index={items}
          closeModel={handleClose}
          postImages={item?.post_attachment}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    marginTop: isIphoneX() ? scale(35) : scale(5),
    marginBottom: 0,
    alignSelf: 'center',
  },
  listCOntainer: {flexGrow: 1, paddingBottom: scale(50)},
  header: {height: scale(50)},
  postCon: {
    paddingVertical: scale(20),
    backgroundColor: theme.colors.white,
  },
  scrollCon: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: scale(15),
    margin: 0,
  },
  imageCon: {
    width: '100%',
    alignSelf: 'center',
    height: theme.SCREENHEIGHT / 3,
  },
  txt: {
    color: theme.colors.black,
    paddingHorizontal: scale(5),
    marginVertical: scale(10),
  },
});

export default ImagesViewModel;
