import * as types from './ActionsTypes';
import {API, getAPICall, postAPICall} from '../../Utils/appApi';
import {Alert} from 'react-native';
import {getLocalText} from '../../Locales/I18n';

// all post show
export const getPost = (page, lastId) => {
  return async (dispatch, getState) => {
    try {
      let success = await getAPICall(
        API.post + '?page=' + page + '&last_id=' + lastId,
      );
      if (success.error) {
        dispatch({type: types.ERROR, payload: success});
      } else {
        dispatch({
          type: types.GETPOST,
          payload: success,
          //  {
          //   ...success,
          //   data:
          //     page === 1
          //       ? success.data
          //       : [...getState().PostReducer.getData.data, ...success.data],
          // },
        });
      }
      return success;
    } catch (error) {
      console.log('POST API catchError', error);
    }
  };
};

export const getPostLocally = (data) => {
  return async (dispatch) => {
    dispatch({type: types.GETPOST, payload: data});
  };
};

export const getReportReasonList = () => {
  return async (dispatch) => {
    try {
      let success = await getAPICall(API.getReportReasonList);
      if (success.error) {
        dispatch({type: types.ERROR, payload: success});
      } else {
        dispatch({type: types.REPORT_REASON_LIST, payload: success.data});
      }
    } catch (error) {
      console.log('getReportReasonList API catchError', error);
    }
  };
};

// add new post
export const addPost = (details, attachment, is_sponsored, group_id) => {
  return async (dispatch) => {
    try {
      dispatch(isPostLoading(true));
      let postData = new FormData();
      postData.append('details', details);
      postData.append('is_sponsored', is_sponsored);
      postData.append('group_id', group_id);
      if (attachment !== undefined || !attachment) {
        attachment.forEach((item, i) => {
          if (item?.type === 'image/jpeg') {
            postData.append('attachment[]', {
              uri: item?.uri,
              type: item?.type,
              name: item?.name || `filename${i}.jpg`,
            });
          } else if (item?.type === 'application/pdf') {
            postData.append('attachment[]', {
              uri: item?.pdf,
              type: item?.type,
              name: item?.name,
            });
          } else if (item?.video.type.slice(0, 5) === 'video') {
            postData.append('attachment[]', {
              uri: item?.video.uri,
              type: item?.video.type,
              name: item?.video.name,
            });
          }
        });
      } else {
        postData.append('attachment[]', '');
      }
      let response = await postAPICall(API.post, postData);
      dispatch(isPostLoading(false));
      if (response.error) {
        Alert.alert(
          response?.errorMsg !== ''
            ? response?.errorMsg
            : getLocalText('ErrorMsgs.worng'),
        );
        dispatch({type: types.ERROR, payload: response});
      } else {
        dispatch({type: types.ADDPOST, payload: response.success});
      }
      return response;
    } catch (error) {
      dispatch(isPostLoading(false));
    }
  };
};

export const isPostLoading = (payload) => {
  return {
    type: types.POSTLOADING,
    payload,
  };
};

export const getPostLoadding = (payload) => {
  return {
    type: types.GETPOSTSUCCESS,
    payload,
  };
};

//post like,share,hide,save
export const postLikeShareSave = (postId, type, emojiValue) => {
  return async (dispatch) => {
    // dispatch(isPostLoading(true));
    let postLikesharesaveData = new FormData();
    postLikesharesaveData.append('post_id', postId);
    postLikesharesaveData.append('type', type);
    if (emojiValue !== undefined) {
      postLikesharesaveData.append('emoji', emojiValue);
    }
    let response = await postAPICall(API.userPost, postLikesharesaveData);
    dispatch(isPostLoading(false));
    if (!response.error) {
      dispatch({type: types.POSTLIKE, payload: response.success});
    }

    return response;
  };
};

//post comment send
export const postCommentSend = (commentId, commentTxt, index) => {
  return async (dispatch) => {
    let commentFormDate = new FormData();
    commentFormDate.append('post_id', commentId);
    commentFormDate.append('comment_text', commentTxt);
    let response = await postAPICall(API.comment, commentFormDate);
    if (response.error) {
      Alert.alert(response.errorMsg);
      isPostLoading(0);
    } else {
      isPostLoading(0);
      dispatch({type: types.COMMENTSENT, payload: response.success});
    }
    return response;
  };
};

//commnent like
export const commentLike = (commentId, userId) => {
  return async (dispatch) => {
    let commentLikeForm = new FormData();
    commentLikeForm.append('comment_id', commentId);
    let response = await postAPICall(API.commentLike, commentLikeForm);
    if (!response.error) {
      dispatch({type: types.COMMENTLIKE, payload: response.success});
    }
    return response;
  };
};

//report post
export const blockAction = (type, payload) => {
  return async (dispatch, getState) => {
      let blockSuccess = await postAPICall(
        type === 0 ? API.blockUser : API.reportGroup,
        payload,
      );
      if (blockSuccess.success) {
        dispatch({type: types.REPORT, payload: blockSuccess.success});
      } else {
        dispatch({type: types.REPORT, payload: blockSuccess.success});
        Alert.alert(blockSuccess.errorMsg);
      }
  };
};

//block user notification
export const susPendNotification = (groupId, PostId) => {
  return async (dispatch) => {
    let formData = new FormData();
    formData.append('group_id', groupId);
    formData.append('user_id', PostId);
    let blockuserNotification = await postAPICall(
      API.suspendUserNotication,
      formData,
    );
    if (blockuserNotification.success) {
      Alert.alert(blockuserNotification.message);
      dispatch({
        type: types.SUSPENDUSERNOTICATION,
        payload: blockuserNotification.success,
      });
    } else {
      dispatch({
        type: types.SUSPENDUSERNOTICATION,
        payload: blockuserNotification.success,
      });
      Alert.alert(blockuserNotification.errorMsg);
    }
  };
};

//make sponsor post (posted post make as sponsor )
export const makeSponsorPost = (postId, people, days, price) => {
  return async (dispatch) => {
    let makeSponsorForm = new FormData();
    makeSponsorForm.append('post_id', postId);
    makeSponsorForm.append('no_of_people', people);
    makeSponsorForm.append('days', days);
    makeSponsorForm.append('price', price ? price : 0);
    let response = await postAPICall(API.makeSponsorPostNew, makeSponsorForm);
    if (response.error) {
    } else {
      dispatch({type: types.COMMENTSENT, payload: response.success});
    }
  };
};

// //add new story unused
// export const addStory = (attachment) => {
//   return async (dispatch) => {
//     try {
//       dispatch({type: types.STORYLOADDING, payload: true});
//       let storyData = new FormData();
//       if (attachment !== undefined || !attachment) {
//         attachment.forEach((item, i) => {
//           if (item?.type === 'image/jpeg') {
//             storyData.append('media[]', {
//               uri: item?.uri,
//               type: item?.type,
//               name: item?.name || `filename${i}.jpg`,
//             });
//           } else if (item?.type === 'application/pdf') {
//             storyData.append('media[]', {
//               uri: item?.pdf,
//               type: item?.type,
//               name: item?.name,
//             });
//           } else if (item?.video.type.slice(0, 5) === 'video') {
//             storyData.append('media[]', {
//               uri: item?.video.uri,
//               type: item?.video.type,
//               name: item?.video.name,
//             });
//           }
//         });
//       } else {
//         storyData.append('media[]', '');
//       }
//       let response = await postAPICall(API.addStory, storyData);
//       if (response.error) {
//         Alert.alert(response?.errorMsg);
//       } else {
//         dispatch({type: types.ADDSTORY, payload: response.success});
//         dispatch({type: types.STORYLOADDING, payload: false});
//       }
//     } catch (error) {
//       console.log('addStory API catchError', error);
//     }
//   };
// };

export const getGroupPost = (page, group_id, lastId, redirectId) => {
  const queryString = redirectId
    ? '?page=' + page + '&last_id=' + lastId + '&post_id=' + redirectId
    : '?page=' + page + '&last_id=' + lastId;
  return async (dispatch, getState) => {
    try {
      let success = await getAPICall(API.getGroupPost + group_id + queryString);
      if (success.error) {
        dispatch({type: types.ERROR, payload: success});
      } else {
        dispatch({
          type: types.GET_GROUP_POST,
          payload: {
            ...success,
            data:
              page === 1
                ? success.data
                : [
                    ...getState().PostReducer.getGroupData.data,
                    ...success.data,
                  ],
          },
        });
      }
      return success;
    } catch (error) {
      console.log('getGroupPost API catchError', error);
    }
  };
};

export const getGroupRoom = (page, group_id, lastId) => {
  return async (dispatch, getState) => {
    try {
      const roomChatFrm = new FormData();
      roomChatFrm.append('room_type', 'Chat');
      roomChatFrm.append('group_id', group_id);
      let success = await postAPICall(
        API.roomList + '?page=' + page + '&last_id=' + lastId,
        roomChatFrm,
      );

      if (success.error) {
        dispatch({type: types.ERROR, payload: success});
      } else {
        dispatch({
          type: types.GET_GROUP_CHAT_ROOM,
          payload: {
            ...success,
            data:
              page === 1
                ? success.data
                : [
                    ...getState().PostReducer.getGroupChatRoomData.data,
                    ...success.data,
                  ],
          },
        });
      }
      return success;
    } catch (error) {
      console.warn('getGroupRoom API catchError', error);
    }
  };
};

export const getChatReoomsLocally = (data) => {
  return async (dispatch) => {
    dispatch({type: types.GET_GROUP_CHAT_ROOM, payload: data});
  };
};

export const getGroupRoomAudio = (page, group_id, lastId) => {
  return async (dispatch, getState) => {
    try {
      const roomAudioFrm = new FormData();
      roomAudioFrm.append('room_type', 'Audio');
      roomAudioFrm.append('group_id', group_id);
      let success = await postAPICall(
        API.roomList + '?page=' + page + '&last_id=' + lastId,
        roomAudioFrm,
      );
      if (success.error) {
        dispatch({type: types.ERROR, payload: success});
      } else {
        dispatch({
          type: types.GET_GROUP_AUDIO_ROOM,
          payload: {
            ...success,
            data:
              page === 1
                ? success.data
                : [
                    ...getState().PostReducer.getGroupAudioRoomData.data,
                    ...success.data,
                  ],
          },
        });
      }
      return success;
    } catch (error) {
      console.log('getGroupRoomAudio API catchError', error);
    }
  };
};
