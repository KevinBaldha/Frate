import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import {useSelector} from 'react-redux';
import SimpleToast from 'react-native-simple-toast';
import Clipboard from '@react-native-clipboard/clipboard';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Feather';
import Icon1 from 'react-native-vector-icons/Entypo';
import {getLocalText} from '../Locales/I18n';
import {images, scale, theme} from '../Utils';
import {Title, Label} from './index';
import {API, postAPICall} from '../Utils/appApi';

const Comment = props => {
  const {
    onPressEmoji,
    onPressSend,
    emojiKeyboard,
    comments,
    onChangeText,
    color,
    item,
    value,
    index,
    userImg,
    onPressCommentLike,
    InteractionsDetails,
    updateCom,
    onPressKeyboard,
  } = props;
  const inputRef = useRef(null);
  const userData = useSelector(state => state.UserInfo);

  const [options, setOptions] = useState();
  const [optionsView, setCommentView] = useState(false);
  const [idx, setidx] = useState(null);
  const [cidx, setCidx] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [edit, setEdit] = useState(false);
  const [editComment, setCommentText] = useState('');
  const ed = useRef(null);
  const handleOptions = (d, i) => {
    setEdit(false);
    setSelectedComment(d);
    if (d.user_id === userData.data.id) {
      setOptions([
        {
          id: 1,
          title: getLocalText('Timeline.Copy'),
          icon: 'copy',
        },
        {id: 2, title: getLocalText('Sponsor.edit'), icon: 'edit'},
      ]);
    } else {
      setOptions([
        {
          id: 1,
          title: getLocalText('Timeline.Copy'),
          icon: 'copy',
        },
      ]);
    }
    if (idx === i) {
      setCommentView(false);
      setidx(null);
    } else {
      setCommentView(true);
      setidx(i);
    }
  };

  const handleAction = async (d, i, c_i) => {
    setCommentView(false);
    setidx(null);
    if (d.user_id === userData.data.id) {
      if (i === 0) {
        Clipboard.setString(d.comment_text);
        SimpleToast.show(getLocalText('Timeline.Copy'));
      } else {
        setEdit(true);
        setCommentText(d.comment_text);
        setCidx(c_i);
      }
    } else {
      if (i === 0) {
        Clipboard.setString(d.comment_text);
        SimpleToast.show(getLocalText('Timeline.Copy'));
      }
    }
  };

  const updateComment = async () => {
    let frmData = new FormData();
    frmData.append('comment_text', editComment);
    frmData.append('id', selectedComment.id);

    try {
      const updateCommnetResponse = await postAPICall(
        API.updateComment,
        frmData,
      );
      if (updateCommnetResponse.success) {
        updateCom();
      } else {
        updateCom();
      }
    } catch (error) {}
    Keyboard.dismiss();
    setEdit(false);
    setCommentText('');
  };
  return (
    <>
      {InteractionsDetails ? null : (
        <View style={[styles.commentCon, styles.shadow]}>
          <View style={styles.topView}>
            <FastImage
              source={
                userImg === '' || undefined
                  ? images.defaultUser
                  : {uri: userImg}
              }
              style={styles.userImage}
            />
            <TextInput
              style={styles.input}
              ref={inputRef}
              placeholder={getLocalText('Post.writehere')}
              placeholderTextColor={theme.colors.darkGrey}
              value={value ? value : item?.commentTxt}
              onChangeText={onChangeText}
              textAlignVertical={'center'}
              onFocus={onPressKeyboard}
            />
            {emojiKeyboard ? (
              <TouchableOpacity
                onPress={() => {
                  inputRef.current.focus();
                  onPressKeyboard();
                }}>
                <Icon1
                  name={'keyboard'}
                  color={theme.colors.darkGrey}
                  size={scale(20)}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={onPressEmoji}>
                <Icon
                  name={'smile'}
                  color={theme.colors.darkGrey}
                  size={scale(20)}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              disabled={color}
              onPress={() => {
                onPressSend(item, index);
                item.commentTxt = '';
              }}>
              <Icon
                name={'send'}
                size={scale(20)}
                color={color ? theme.colors.darkGrey : theme.colors.blue}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {comments === undefined || comments?.length === 0 ? (
        <View style={styles.noComment}>
          <Title title={getLocalText('Post.noComment')} />
        </View>
      ) : (
        <View
          style={{
            padding: scale(20),
          }}>
          {comments &&
            comments.slice(0, 2).map((d, i) => {
              return (
                <View key={i}>
                  <View style={[styles.replayCon]}>
                    <View style={styles.row}>
                      <FastImage
                        source={
                          d?.user_pic?.original
                            ? {uri: d?.user_pic?.original}
                            : images.profilepick
                        }
                        style={styles.userImage}
                      />
                      <Label
                        title={d.name}
                        style={{
                          left: scale(10),
                          color: InteractionsDetails
                            ? theme.colors.blue
                            : theme.colors.grey2,
                          textDecorationLine:
                            InteractionsDetails && 'underline',
                        }}
                      />
                    </View>
                    {InteractionsDetails || edit ? null : (
                      <Text style={styles.time}>{d?.time}</Text>
                    )}
                  </View>
                  <View style={styles.row}>
                    {edit && cidx === i ? (
                      <TextInput
                        value={editComment}
                        onChangeText={txt => {
                          setCommentText(txt);
                        }}
                        style={styles.commentEditView}
                        onSubmitEditing={() => {
                          updateComment();
                        }}
                      />
                    ) : (
                      <TouchableOpacity
                        ref={ed}
                        key={i.toString()}
                        onPress={() => {
                          handleOptions(d, i);
                        }}>
                        <Text
                          numberOfLines={5}
                          style={[
                            styles.replaytxt,
                            InteractionsDetails ? {marginLeft: scale(50)} : {},
                            {
                              color: InteractionsDetails
                                ? theme.colors.grey10
                                : theme.colors.black,
                            },
                          ]}>
                          {d?.comment_text}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {optionsView && idx === i ? (
                    <View style={styles.optionsCon}>
                      {options.map((od, oi) => {
                        return (
                          <TouchableOpacity
                            key={oi}
                            onPress={() => {
                              handleAction(d, oi, i);
                            }}
                            style={[styles.row, styles.alignItemsCenter]}>
                            <Icon
                              size={scale(15)}
                              color={theme.colors.blue}
                              name={od.icon}
                            />
                            <Label
                              title={od.title}
                              style={{marginLeft: scale(10)}}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}

                  {/* comment like icon */}
                  {InteractionsDetails ? null : (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => onPressCommentLike(d.id, index, i)}>
                      <Icon
                        name={'thumbs-up'}
                        size={scale(15)}
                        color={
                          d.is_like ? theme.colors.blue : theme.colors.grey10
                        }
                      />
                      <Text
                        style={[
                          styles.text,
                          {
                            color: d.is_like
                              ? theme.colors.blue
                              : theme.colors.grey10,
                          },
                        ]}>
                        {getLocalText(d.is_like ? 'Post.liked' : 'Post.like')}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {comments?.length - 1 !== i && (
                    <View style={styles.divider} />
                  )}
                </View>
              );
            })}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
  row: {flexDirection: 'row', alignItems: 'center'},
  userImage: {
    width: scale(0),
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
  replayCon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  replaytxt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    paddingTop: scale(10),
    width: theme.SCREENWIDTH - scale(90),
    marginHorizontal: scale(2),
  },
  time: {
    position: 'absolute',
    right: scale(0),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    color: theme.colors.grey10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: scale(9),
    left: scale(5),
    paddingTop: scale(5),
    width: scale(50),
  },
  text: {
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    marginLeft: scale(4),
  },
  divider: {
    backgroundColor: theme.colors.divider3,
    marginVertical: scale(8),
    width: '95%',
    height: 1,
    alignSelf: 'center',
  },
  noComment: {
    height: theme.SCREENHEIGHT / 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsCon: {
    alignSelf: 'flex-end',
    padding: scale(6),
    paddingHorizontal: scale(55),
    backgroundColor: theme.colors.white,
    position: 'absolute',
    zIndex: 111,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
    borderRadius: scale(5),
  },
  commentEditView: {
    marginVertical: scale(5),
    height: scale(45),
    borderBottomWidth: scale(0.5),
    borderColor: theme.colors.black,
    width: '100%',
  },
  alignItemsCenter: {
    alignItems: 'center',
  },
});

export default Comment;
