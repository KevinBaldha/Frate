import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/Feather';
import {useSelector} from 'react-redux';
import SimpleToast from 'react-native-simple-toast';
import {API, postAPICall} from '../Utils/appApi';
import {getLocalText} from '../Locales/I18n';
import {scale, images, theme} from '../Utils';
import {Label} from './index';
import externalStyle from '../Css';
const CommentBox = (props) => {
  let {
    item,
    index,
    onPressCommentLike,
    InteractionsDetails,
    updateCom,
    setPreviosIndexClick,
    previousIndexClick,
  } = props;
  const userData = useSelector((state) => state.UserInfo);

  const [options, setOptions] = useState();
  const [optionsView, setCommentView] = useState(false);
  const [cidx, setCidx] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [edit, setEdit] = useState(false);
  const [editComment, setCommentText] = useState('');

  const handleAction = async (d, i, c_i) => {
    setCommentView(false);
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

  const handleOptions = (d, i) => {
    setEdit(false);
    setSelectedComment(d);
    setCommentView(true);
    setPreviosIndexClick(previousIndexClick === i ? -1 : i);

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
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.replayContainer,
          externalStyle.shadow,
          {
            elevation: scale(4),
            shadowColor: theme.colors.black,
            shadowRadius: scale(5),
          },
        ]}
        onPress={() => {
          handleOptions(item, index);
        }}>
        <View key={index}>
          <View style={styles.replayCon}>
            <FastImage
              source={
                item?.user_pic?.optimize
                  ? {uri: item?.user_pic?.optimize}
                  : images.profilepick
              }
              style={styles.userImage}
            />
            <Label title={item?.user_name} style={styles.nametxt} />
            {InteractionsDetails ? null : (
              <Text style={styles.time}>{item?.time}</Text>
            )}
          </View>
          <View style={styles.row}>
            {edit && cidx === index ? (
              <TextInput
                value={editComment}
                onChangeText={(txt) => {
                  setCommentText(txt);
                }}
                style={styles.commentEditView}
                onSubmitEditing={() => {
                  updateComment();
                }}
              />
            ) : (
              <Text
                style={[
                  styles.replaytxt,
                  {
                    color: theme.colors.black,
                  },
                ]}>
                {item?.comment_text}
              </Text>
            )}
          </View>
        </View>
        {InteractionsDetails ? null : (
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => onPressCommentLike(item, index)}>
            <Icon
              name={'thumbs-up'}
              size={scale(15)}
              color={item?.is_like ? theme.colors.blue : theme.colors.grey10}
            />
            <Text
              style={[
                styles.text,
                {
                  color: item?.is_like
                    ? theme.colors.blue
                    : theme.colors.grey10,
                },
              ]}>
              {getLocalText(item?.is_like ? 'Post.liked' : 'Post.like')}
            </Text>
          </TouchableOpacity>
        )}
        {optionsView && previousIndexClick === index ? (
          <View style={styles.optionsCon}>
            {options.map((od, oi) => {
              return (
                <TouchableOpacity
                  key={oi}
                  onPress={() => {
                    handleAction(item, oi, index);
                  }}
                  style={[
                    styles.row,
                    {
                      alignItems: 'center',
                    },
                  ]}>
                  <Icon
                    size={scale(15)}
                    color={theme.colors.blue}
                    name={od.icon}
                  />
                  <Label title={od.title} style={{marginLeft: scale(10)}} />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </TouchableOpacity>
    </>
  );
};

export default CommentBox;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  replayContainer: {
    marginVertical: scale(4),
    width: '96%',
    alignSelf: 'center',
    padding: scale(5),
    borderRadius: scale(10),
    marginHorizontal: scale(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 5.46,
    backgroundColor: theme.colors.white,
    elevation: scale(2),
  },
  replayCon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replaytxt: {
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    paddingTop: scale(10),
    width: '95%',
    marginLeft: scale(10),
  },
  time: {
    position: 'absolute',
    right: scale(5),
    fontFamily: theme.fonts.muktaRegular,
    fontSize: scale(12),
    color: theme.colors.grey10,
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
  nametxt: {
    left: scale(10),
    color: theme.colors.grey2,
    textDecorationLine: 'underline',
  },
  button: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginHorizontal: scale(9),
    paddingVertical: scale(5),
  },
  text: {
    fontSize: scale(12),
    fontFamily: theme.fonts.muktaRegular,
    marginLeft: scale(4),
  },
  optionsCon: {
    alignSelf: 'center',
    width: scale(150),
    padding: scale(6),
    paddingHorizontal: scale(25),
    top: scale(20),
    right: scale(20),
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
});
