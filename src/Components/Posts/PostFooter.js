import React, {useState} from 'react';
import {Text, View, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, images} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import {
  Comment,
  Label,
  PostsCommentModel,
  PostsLikeModel,
  GroupImages,
} from '../index';
import {ChatIcon} from '../../Assets/SVGs';
import FastImage from 'react-native-fast-image';

const PostFooter = (props) => {
  const {
    onLikePress,
    item,
    index,
    onSharePress,
    onPressEmoji,
    emojiKeyboard,
    onChangeText,
    value,
    color,
    onPressSend,
    onPressCommentLike,
    InteractionsDetails,
    commentOpen,
    userImg,
    counterShow,
    updateCommentCount,
    onPressComment,
    isOwnPost,
    timeline,
    joinGroup,
    handleMsgPopUp,
    onLikeLongPress,
    reportReasonList,
  } = props;
  const [commentView, setCommentView] = useState(false);
  const [likeModel, setLikeModel] = useState(false);

  const handlePostClose = () => {
    setCommentView(!commentView);
  };
  const handlePostLikeClose = () => {
    setLikeModel(!likeModel);
  };

  return (
    <>
      {InteractionsDetails && (
        <View style={styles.row}>
          <GroupImages members={item?.liked_by} InteractionsDetails={true} />
          <Text style={styles.text1}>
            {item?.total_like + ' ' + getLocalText('Post.like')}
          </Text>
        </View>
      )}

      {!counterShow && ( //Show ccomments count and likes
        <View
          style={[
            styles.counterView,
            {flexDirection: item?.total_like === 0 ? 'row-reverse' : 'row'},
          ]}>
          {item?.total_like !== 0 && (
            <TouchableOpacity
              style={styles.row1}
              onPress={() => handlePostLikeClose()}>
              <Icon
                name={'thumbs-up'}
                size={scale(14)}
                color={theme.colors.darkGrey}
              />
              {item?.total_like === 1 && item?.is_like ? (
                <Label
                  title={item?.is_like ? getLocalText('Post.u') : ''}
                  style={styles.label}
                />
              ) : (
                <>
                  <Label
                    title={item?.is_like ? getLocalText('Post.you') : ''}
                    style={styles.label}
                  />
                  {/* <Label title={item?.total_like} style={styles.label} /> */}
                  <Label
                    title={
                      item?.total_like === 1 && !item?.is_like
                        ? item?.total_like
                        : item?.total_like === 1 && item?.is_like
                        ? ''
                        : (item?.is_like && item?.total_like > 2) ||
                          (item?.is_like && item?.total_like === 2)
                        ? item?.total_like - 1
                        : item?.total_like
                    }
                    style={styles.label}
                  />
                  <Label
                    // title={item?.is_like ? getLocalText('Post.other') : ''}
                    title={
                      item?.is_like && item?.total_like > 2
                        ? getLocalText('Post.other')
                        : item?.is_like && item?.total_like === 2
                        ? getLocalText('Post.othertxt')
                        : ''
                    }
                    style={styles.label}
                  />
                </>
              )}
            </TouchableOpacity>
          )}

          {item?.total_comment !== 0 && (
            <TouchableOpacity
              style={[styles.row1]}
              onPress={() => {
                joinGroup ? handlePostClose() : null;
              }}>
              <Icon
                name={'message-square'}
                size={scale(14)}
                color={theme.colors.darkGrey}
              />
              <TouchableOpacity
                style={styles.commentSection}
                onPress={() =>
                  joinGroup || joinGroup === undefined
                    ? commentOpen
                      ? onPressComment()
                      : handlePostClose()
                    : null
                }>
                <Label title={item?.total_comment} style={styles.label} />
                <Label
                  title={getLocalText('Post.comment')}
                  style={styles.label}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.container}>
        {/* Timeline post like button */}
        <TouchableOpacity
          disabled={joinGroup || joinGroup === undefined ? false : true}
          onPress={() => {
            item?.is_blocked_user
              ? Alert.alert(getLocalText('ErrorMsgs.reportUser'))
              : onLikePress(item, index);
          }}
          onLongPress={(evt) => {
            onLikeLongPress(evt, item);
          }}
          style={[styles.button]}>
          {item?.is_like ? (
            <FastImage
              source={
                item?.emoji === 1
                  ? images.likeEmoji
                  : item?.emoji === 2
                  ? images.heartEmoji
                  : item?.emoji === 3
                  ? images.clapEmoji
                  : item?.emoji === 4
                  ? images.happyEmoji
                  : item?.emoji === 5
                  ? images.angryEmoji
                  : images.likeEmoji
              }
              style={{width: scale(16), height: scale(16)}}
            />
          ) : (
            <>
              <Icon
                name={'thumbs-up'}
                size={scale(14)}
                color={
                  item?.is_like ? theme.colors.blue : theme.colors.darkGrey
                }
              />
            </>
          )}

          <Text
            style={[
              styles.text,
              {color: item?.is_like ? theme.colors.blue : theme.colors.black},
            ]}>
            {getLocalText(
              item?.is_like && item?.emoji === 1
                ? 'Post.liked'
                : item?.emoji === 2
                ? 'Post.heart'
                : item?.emoji === 3
                ? 'Post.clap'
                : item?.emoji === 4
                ? 'Post.happy'
                : item?.emoji === 5
                ? 'Post.angry'
                : 'Post.like',
            )}
          </Text>
        </TouchableOpacity>

        {/* Timeline post comment button */}
        <TouchableOpacity
          style={styles.button}
          disabled={joinGroup || joinGroup === undefined ? false : true}
          onPress={() =>
            joinGroup || joinGroup === undefined
              ? commentOpen
                ? onPressComment()
                : item?.is_blocked_user
                ? Alert.alert(getLocalText('ErrorMsgs.reportUser'))
                : handlePostClose()
              : null
          }>
          <Icon
            name="message-square"
            size={scale(14)}
            color={
              item?.commentOpen || commentOpen
                ? theme.colors.blue
                : theme.colors.darkGrey
            }
          />
          <Text
            style={[
              styles.text,
              {
                color:
                  item?.commentOpen || commentOpen
                    ? theme.colors.blue
                    : theme.colors.black,
              },
            ]}>
            {getLocalText('Post.comment')}
          </Text>
        </TouchableOpacity>

        {/* Timeline post share button */}
        <TouchableOpacity
          disabled={
            !item?.is_reshared
              ? true
              : joinGroup || joinGroup === undefined
              ? false
              : true
          }
          style={[styles.button]}
          onPress={() => {
            item?.is_blocked_user
              ? Alert.alert(getLocalText('ErrorMsgs.reportUser'))
              : onSharePress({item, index});
          }}>
          <Icon
            name="corner-right-up"
            size={scale(14)}
            style={{opacity: !item?.is_reshared ? 0.2 : 1}}
            color={theme.colors.darkGrey}
          />

          <Text
            style={[
              styles.text,
              {left: scale(-2), opacity: !item?.is_reshared ? 0.2 : 1},
            ]}>
            {getLocalText('Post.share')}
          </Text>
        </TouchableOpacity>
        {!isOwnPost ? (
          <TouchableOpacity
            style={styles.saveIcon}
            onPress={() => handleMsgPopUp(item, index)}>
            {!InteractionsDetails && (
              <ChatIcon height={scale(22)} width={scale(22)} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {item?.total_comment !== 0 && timeline ? (
        <Comment
          {...props}
          item={item}
          index={index}
          comments={item?.comments}
          onPressEmoji={onPressEmoji}
          emojiKeyboard={emojiKeyboard}
          onChangeText={onChangeText}
          value={value}
          color={color}
          onPressSend={onPressSend}
          onPressCommentLike={onPressCommentLike}
          InteractionsDetails={InteractionsDetails}
        />
      ) : null}
      <PostsCommentModel
        isVisible={commentView}
        close={handlePostClose}
        data={item}
        index={index}
        onPressEmoji={onPressEmoji}
        emojiKeyboard={emojiKeyboard}
        onChangeText={onChangeText}
        value={value}
        color={color}
        onPressSend={onPressSend}
        onPressCommentLike={onPressCommentLike}
        userImg={userImg}
        updateCommentCount={updateCommentCount}
        isOwnPost={isOwnPost}
        reportReasonList={reportReasonList}
        timeline={timeline}
      />
      <PostsLikeModel
        isVisible={likeModel}
        close={handlePostLikeClose}
        data={item}
      />
    </>
  );
};

export default PostFooter;

const styles = StyleSheet.create({
  container: {
    marginTop: scale(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(9),
    height: scale(30),
  },
  text: {
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    marginLeft: scale(4),
  },
  saveIcon: {
    position: 'absolute',
    right: scale(5),
    height: scale(20),
    width: scale(20),
  },
  row: {
    flexDirection: 'row',
    marginTop: scale(6),
  },
  text1: {
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.grey10,
    marginLeft: scale(5),
  },
  counterView: {
    borderWidth: 0.3,
    width: '100%',
    paddingVertical: scale(4),
    alignItems: 'center',
    flexDirection: 'row',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderColor: theme.colors.grey12,
    justifyContent: 'space-between',
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    height: scale(25),
  },
  label: {
    marginHorizontal: scale(2),
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.black,
    letterSpacing: 0.2,
  },
  commentView: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    right: 5,
    bottom: 2,
    marginTop: 5,
  },
  commentSection: {flexDirection: 'row'},
});
