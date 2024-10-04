/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Linking} from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Entypo';
import {
  PostFooter,
  VideoShow,
  PostHeader,
  DocumentsFile,
  Comment,
} from './index';
import {Config, scale, theme} from '../Utils';
import {ConvertInFranch, LanguageIs} from '../Utils/helper';
import {getLocalText} from '../Locales/I18n';
import {HASHTAG_FORMATTER} from '../Screens/EmojiBoard/utils';
import Hyperlink from 'react-native-hyperlink';

const PostCard = (props) => {
  const {
    item,
    postOption,
    index,
    hideFooter,
    handlePostModal,
    onLikePress,
    showOption,
    optionsIconColor,
    onCommentPress,
    onPressEmoji,
    onPressKeyboard,
    emojiKeyboard,
    onChangeText,
    value,
    color,
    onPressSend,
    onSharePress,
    openImageView,
    userImg,
    onPressCommentLike,
    bookmark,
    postId,
    InteractionsDetails,
    onPressGroup,
    onPressProfile,
    counterShow,
    updateCommentCount,
    onPressSponsor,
    closePopup,
    userData,
    onPressSharePost,
    timeline,
    onPressHastag,
    hashTag,
    joinGroup,
    updateCom,
    handleMsgPopUp,
    handlePostLike,
    reportReasonList,
  } = props;
  let isOwnPost = item?.user_id === userData?.id;
  const [Translation, setTranslation] = useState(false);
  const [details, setDetails] = useState('');
  const [seemore, setMore] = useState(false);

  const translate = async (data) => {
    let result = await ConvertInFranch(data);
    await setDetails(result);
  };

  return (
    <View style={[styles.postCard]}>
      {item === '' ? (
        Config.NO_DATA_COMPO()
      ) : (
        <>
          <PostHeader
            onPressSponsor={onPressSponsor}
            item={item}
            index={index}
            handleOptions={(evt) => handlePostModal(item, index, evt)}
            postOption={postOption}
            showOption={showOption}
            optionsIconColor={optionsIconColor}
            postId={postId}
            onPressGroup={onPressGroup}
            onPressProfile={onPressProfile}
            userData={userData}
            onPressSharePost={onPressSharePost}
          />

          {item?.details === null ||
          LanguageIs(item?.details)[0] === undefined ? (
            <>
              <Hyperlink
                linkStyle={{color: 'blue'}}
                onPress={(url) => {
                  Linking?.openURL(url);
                }}>
                <Text
                  style={[
                    styles.postDescription,
                    {
                      color: 'black',
                    },
                  ]}>
                  {item?.details}
                </Text>
              </Hyperlink>
            </>
          ) : LanguageIs(item?.details)[0][0] === 'french' ? (
            <>
              {!Translation && (
                <Hyperlink
                  linkStyle={{color: 'blue'}}
                  onPress={(url) => {
                    Linking.openURL(url);
                  }}>
                  <Text
                    style={[
                      styles.postDescription,
                      {
                        color: 'black',
                      },
                    ]}>
                    {item?.details}
                  </Text>
                </Hyperlink>
              )}

              {Translation && details !== '' ? (
                <Hyperlink
                  linkStyle={{color: 'blue'}}
                  onPress={(url) => {
                    Linking.openURL(url);
                  }}>
                  <Text
                    style={[
                      styles.postDescription,
                      {
                        color: 'black',
                      },
                    ]}>
                    {details}
                  </Text>
                </Hyperlink>
              ) : null}

              <TouchableOpacity
                style={{marginTop: 5}}
                onPress={() => {
                  setTranslation(!Translation);
                  translate(item?.details);
                }}>
                <Text>
                  <Icon name="language" size={scale(18)} />
                  {getLocalText('Timeline.translate')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <Hyperlink
                linkStyle={{color: 'blue'}}
                onPress={(url) => {
                  Linking.openURL(url);
                }}>
                <Text
                  style={[
                    styles.postDescription,
                    {
                      color: 'black',
                    },
                  ]}>
                  {hashTag
                    ? item?.details.length > 150
                      ? seemore
                        ? HASHTAG_FORMATTER(item?.details, onPressHastag)
                        : HASHTAG_FORMATTER(
                            item?.details.slice(0, 150),
                            onPressHastag,
                          )
                      : HASHTAG_FORMATTER(item?.details, onPressHastag)
                    : item?.details.length > 150
                    ? seemore
                      ? item?.details
                      : item?.details.slice(0, 150)
                    : item?.details}
                  <Text
                    style={styles.more}
                    onPress={() => {
                      setMore(!seemore);
                    }}>
                    {item?.details.length > 150 &&
                      (seemore ? '\nLess' : '\nSee More')}
                  </Text>
                </Text>
              </Hyperlink>
            </View>
          )}

          <View style={[styles.photosContainer]}>
            {item?.post_attachment &&
              item?.post_attachment.slice(0, 4).map((d, i) => {
                return (
                  <View
                    key={i.toString()}
                    style={[
                      styles.margin1,
                      {
                        width:
                          item?.post_attachment.length === 3
                            ? i === 0
                              ? '98%'
                              : '48%'
                            : item?.post_attachment.length > 1
                            ? '48%'
                            : '98%',
                        aspectRatio:
                          d.media_type === 'file'
                            ? 2.5
                            : item?.post_attachment.length === 3
                            ? i === 0
                              ? 1.9
                              : 1
                            : item?.post_attachment.length > 1
                            ? 1
                            : 1.5,
                      },
                    ]}>
                    {d?.media_type === 'file' ||
                    d?.media_type === 'document' ? (
                      <DocumentsFile item={d} index={index} isAttach={false} />
                    ) : d.media_type === 'image' ? (
                      <TouchableOpacity
                        onFocus={() => openImageView(item, index, d)}
                        onPress={() => openImageView(item, index, d)}>
                        <FastImage
                          source={{uri: d.uri?.original}}
                          style={styles.image}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </TouchableOpacity>
                    ) : d.media_type === 'video' ? (
                      <TouchableOpacity
                        onFocus={() => openImageView(item, index, d)}
                        onPress={() => openImageView(item, index, d)}>
                        <VideoShow
                          url={d.uri}
                          item={item}
                          thumbnail={d?.thumbnail}
                        />
                      </TouchableOpacity>
                    ) : null}
                    {item?.post_attachment.length > 4 && i === 3 && (
                      <TouchableOpacity
                        style={styles.photosTextView}
                        onPress={() => openImageView(item, index)}>
                        <Text style={styles.photoText}>{`+${
                          item?.post_attachment.length - 4
                        } photos`}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
          </View>
          {hideFooter ? null : (
            <PostFooter
              item={item}
              index={index}
              postId={postId}
              onLikePress={onLikePress}
              onLikeLongPress={(evt) => handlePostLike(item, index, evt)}
              onCommentPress={onCommentPress}
              onPressEmoji={onPressEmoji}
              onPressKeyboard={onPressKeyboard}
              emojiKeyboard={emojiKeyboard}
              onChangeText={onChangeText}
              value={value}
              color={color}
              onPressSend={onPressSend}
              onSharePress={onSharePress}
              userImg={userImg}
              onPressCommentLike={onPressCommentLike}
              InteractionsDetails={InteractionsDetails}
              bookmark={bookmark}
              counterShow={counterShow}
              updateCommentCount={updateCommentCount}
              closePopup={closePopup}
              isOwnPost={isOwnPost}
              timeline={timeline}
              joinGroup={joinGroup}
              updateCom={updateCom}
              handleMsgPopUp={handleMsgPopUp}
              reportReasonList={reportReasonList}
            />
          )}

          {item?.onCommentPress ? (
            <Comment
              comments={item?.comments}
              reportReasonList={reportReasonList}
            />
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    marginHorizontal: scale(18),
    borderRadius: scale(9),
    padding: scale(11),
    marginBottom: scale(11),
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.16,
    shadowRadius: 1.2,
    elevation: 1,
    backgroundColor: theme.colors.white,
  },
  postDescription: {
    marginVertical: scale(8),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
  },
  photosContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photosTextView: {
    width: '100%',
    aspectRatio: 1,
    position: 'absolute',
    backgroundColor: `${theme.colors.black}50`,
    bottom: '1%',
    right: '1%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: theme.colors.white,
    fontSize: scale(16),
    fontFamily: theme.fonts.robotoBold,
  },
  more: {
    color: theme.colors.blue,
    fontSize: scale(13),
    fontFamily: theme.fonts.rubikNormal,
  },
  margin1: {
    margin: '1%',
  },
});

export default PostCard;
