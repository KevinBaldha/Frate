import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';
import Icon from 'react-native-vector-icons/Feather';
import Share from 'react-native-share';
import FastImage from 'react-native-fast-image';
// import EmojiBoard from './EmojiBoard';
import {scale, theme} from '../Utils';
import {
  PostFooter,
  PostHeader,
  FullImageModel,
  VideoShow,
  Label,
} from '../Components';
import {API, baseUrlForShare, getAPICall} from '../Utils/appApi';
import EmojiPicker from 'rn-emoji-keyboard';

const SignlePost = props => {
  const {itemId} = props.route?.params;
  const [comment, setComment] = useState(false);
  const [item, setPostItem] = useState('');
  const [items, setitem] = useState();
  const [commenttxt, setCommenttx] = useState('');
  const [model, setModel] = useState(false);
  const [isPaused, setisPaused] = useState(true);
  const [emoji, setEmojiKey] = useState(false);

  const toggleVideoButton = () => {
    setisPaused(!isPaused);
  };
  useEffect(() => {
    if (itemId) {
      getSinglepost(itemId);
    }
  }, [itemId]);

  const getSinglepost = async id => {
    try {
      let success = await getAPICall(API.getSinglePost + id);
      if (success.error) {
      } else {
        setPostItem(success.data);
      }
    } catch (error) {
      console.log('getSinglePost API call failed:', error);
    }
  };
  //like press
  const onLikePress = (postLike, index) => {
    postLike.is_like = !postLike.is_like;
    // onPressLike(postLike, index);
  };
  //open comment view
  const onPressComment = () => {
    setComment(!comment);
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

  const setEmoji = emojicode => {
    setCommenttx(commenttxt + emojicode.code);
  };
  const onPressProfileHandle = async data => {
    // await onPressProfile(data);
  };
  const onPressGroupHandle = async data => {
    // await onPressGroup(data);
    // close();
  };

  const safeEmojiBackspace = str => {
    let initialRealCount = fancyCount(str);
    while (str.length > 0 && fancyCount(str) !== initialRealCount - 1) {
      str = str.substring(0, str.length - 1);
    }
    return str;
  };

  const fancyCount = str => {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.goBack();
          }}
          style={{
            marginHorizontal: scale(15),
            marginVertical: Platform.OS === 'android' ? scale(20) : scale(10),
          }}>
          <Icon name="arrow-left" size={scale(25)} color={theme.colors.blue} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollCon}>
        {item ? (
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
              onCommentPress={onPressComment}
              onSharePress={onShare}
              onPressEmoji={onPressEmoji}
              onPressKeyboard={() => setEmojiKey(false)}
              emojiKeyboard={emoji}
              bookmark={true}
              commentOpen={comment}
              onLikeLongPress={() => {}}
            />
          </View>
        ) : (
          <View />
        )}
        {item
          ? item?.post_attachment.map((img, i) => {
              return (
                <View
                  style={{
                    marginVertical: scale(5),
                  }}>
                  {img.media_type === 'image' ? (
                    <TouchableOpacity
                      onPress={() => {
                        setModel(true);
                        setitem(i);
                      }}>
                      <FastImage
                        style={styles.imageCon}
                        source={
                          img.image?.original
                            ? img.image?.original
                            : {uri: img.uri?.original}
                        }
                        resizeMode={FastImage.resizeMode.stretch}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setModel(true);
                        setitem(i);
                      }}>
                      <VideoShow
                        thumbnail={img.thumbnail}
                        videoStyle={{
                          height: theme.SCREENHEIGHT / 2,
                        }}
                        url={img.uri}
                        isPaused={isPaused}
                        handleMuteVideo={toggleVideoButton}
                        endVideo={toggleVideoButton}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          : null}
      </ScrollView>

      {/* unused */}
      <EmojiPicker
        onEmojiSelected={setEmoji}
        open={emoji}
        onClose={() => setEmoji(false)}
      />
      {/* <EmojiBoard
        showBoard={emoji}
        onClick={setEmoji}
        onRemove={() => {
          var newText = safeEmojiBackspace(commenttxt);
          setCommenttx(newText);
        }}
        onClose={() => setEmoji(false)}
      /> */}
      <FullImageModel
        isShow={model}
        index={items}
        closeModel={handleClose}
        postImages={item?.post_attachment}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    width: theme.SCREENWIDTH,
    height: theme.SCREENHEIGHT,
    marginTop: isIphoneX() ? scale(25) : scale(0),
    marginBottom: 0,
    flex: 1,
    alignSelf: 'center',
  },
  header: {height: scale(50), marginTop: -10},
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

export default SignlePost;
