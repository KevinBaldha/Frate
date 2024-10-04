import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Platform, TouchableOpacity, Text} from 'react-native';
import Pinchable from 'react-native-pinchable';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import {scale, theme, height} from '../../Utils';
import {getLocalText} from '../../Locales/I18n';
import externalStyle from '../../Css';
import {VideoShow} from '../index';

const PostViewerModel = (props) => {
  const {
    isShow,
    closeModel,
    postImages,
    userImagePost,
    onLikePress,
    postIndex,
    onCommentPress,
    onPressShare,
  } = props;
  const [isPaused, setisPaused] = useState(true);
  const [postItem, setPostItem] = useState(postImages);
  const isLikeModel = '1';

  useEffect(() => {
    setPostItem(postImages);
  }, [postImages]);

  const toggleVideoButton = () => {
    setisPaused(!isPaused);
  };

  const likeButton = () => {
    postItem.is_like = !postItem?.is_like;
    setPostItem(postItem);
    if (postItem?.is_like) {
      postItem.total_like = postItem?.total_like + 1;
      setPostItem(postItem);
    } else {
      postItem.total_like = postItem?.total_like - 1;
      setPostItem(postItem);
    }
    onLikePress(postImages, postIndex, isLikeModel);
  };
  return (
    <Modal
      isVisible={isShow}
      animationIn="slideInUp"
      style={styles.flex1}
      statusBarTranslucent
      deviceHeight={height}
      animationOut="slideOutDown"
      backdropColor={theme.colors.black1}>
      <View
        style={[
          externalStyle.shadow,
          styles.headerCon,
          {shadowRadius: scale(3)},
        ]}>
        <View style={styles.subContainer}>
          <View style={[styles.postTopContainer]}>
            <TouchableOpacity onPress={() => {}}>
              <FastImage
                style={styles.userImage}
                source={{uri: postItem?.user_pic?.original}}
                resizeMode={FastImage.resizeMode.cover}
              />
            </TouchableOpacity>
            <View style={styles.viewname}>
              <Text style={styles.usertxt}>
                {postItem?.first_name + ' ' + postItem?.last_name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => closeModel()}
              style={styles.iconClose}>
              <Icon name="x" size={scale(25)} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          {userImagePost?.media_type === 'image' ? (
            <Pinchable
              style={{
                width: theme.SCREENWIDTH * 0.9,
                height: theme.SCREENHEIGHT * 0.5,
              }}>
              <FastImage
                style={styles.imageCon}
                source={
                  userImagePost?.image || {
                    uri: userImagePost?.uri?.original || userImagePost?.uri,
                  }
                }
                resizeMode={FastImage.resizeMode.cover}
              />
            </Pinchable>
          ) : userImagePost?.media_type === 'video' ? (
            <Pinchable>
              <VideoShow
                url={userImagePost?.uri}
                thumbnail={userImagePost?.thumbnail}
                videoStyle={styles.videoContain}
                isPaused={isPaused}
                handleMuteVideo={toggleVideoButton}
                endVideo={toggleVideoButton}
                fullScreen={true}
                resizeMode="contain"
                moveVolume={(data) => {}}
              />
            </Pinchable>
          ) : null}
          <View style={styles.counterView}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                // onLikePress(postItem, postIndex, isLikeModel);
                likeButton();
              }}>
              <Icon
                name={'thumbs-up'}
                size={scale(14)}
                // color={theme.colors.white}
                color={
                  postItem?.is_like ? theme.colors.blue : theme.colors.white
                }
              />

              <Text
                style={[
                  styles.text,
                  {
                    color: postItem?.is_like
                      ? theme.colors.blue
                      : theme.colors.white,
                  },
                ]}>
                {getLocalText('Post.like')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                onCommentPress();
              }}>
              <Icon
                name="message-square"
                size={scale(14)}
                color={theme.colors.white}
              />
              <Text
                style={[
                  styles.text,
                  {
                    color: theme.colors.white,
                  },
                ]}>
                {getLocalText('Post.comment')}
              </Text>
            </TouchableOpacity>
            {postImages.is_reshared && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  onPressShare();
                }}>
                <Icon
                  name="corner-right-up"
                  size={scale(14)}
                  color={theme.colors.white}
                />

                <Text style={[styles.text, {left: scale(-2)}]}>
                  {getLocalText('Post.share')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.details}> {postItem?.details} </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  headerCon: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? scale(20) : scale(20),
    justifyContent: 'center',
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.SCREENWIDTH * 0.9,
    height: theme.SCREENHEIGHT * 0.6,
  },
  imageCon: {
    marginVertical: scale(5),
    width: '100%',
    height: '98%',
    borderRadius: scale(10),
    overflow: 'hidden',
  },
  iconClose: {
    position: 'absolute',
    zIndex: 11,
    alignSelf: 'flex-end',
    right: scale(-1),
    top: scale(10),
  },
  square: {
    zIndex: 11,
    alignSelf: 'flex-end',
    top: scale(20),
  },
  videoContain: {
    width: theme.SCREENWIDTH * 0.9,
    height: theme.SCREENHEIGHT * 0.55,
    alignSelf: 'center',
  },
  postTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: theme.SCREENWIDTH * 0.9,
    marginBottom: scale(5),
  },
  userImage: {
    height: scale(40),
    width: scale(40),
    borderRadius: scale(25),
    overflow: 'hidden',
  },
  viewname: {
    width: '83%',
  },
  usertxt: {
    fontSize: scale(14),
    fontFamily: theme.fonts.muktaMedium,
    color: theme.colors.white,
  },
  counterView: {
    flexDirection: 'row',
    width: theme.SCREENWIDTH * 0.9,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(9),
  },
  text: {
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    color: theme.colors.white,
    marginLeft: scale(4),
  },
  flex1: {
    flex: 1,
  },
  details: {
    alignSelf: 'flex-start',
    color: theme.colors.white,
    marginTop: 20,
  },
});

export default PostViewerModel;
