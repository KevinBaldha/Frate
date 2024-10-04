import * as types from '../Actions/ActionsTypes';

const initialState = {
  getData: [],
  getGroupData: [],
  getGroupChatRoomData: [],
  getGroupAudioRoomData: [],
  postData: [],
  load: false,
  getPostLoad: false,
  postLike: '',
  commentLike: '',
  postComment: '',
  errorMsg: '',
  report: '',
  story: '',
  storyLoadding: false,
  reportReasonList: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.GETPOST:
      return {
        ...state,
        getData: action.payload,
      };
    case types.REPORT_REASON_LIST:
      return {
        ...state,
        reportReasonList: action.payload,
      };
    case types.ADDPOST:
      return {
        ...state,
        postData: action.payload,
      };
    case types.POSTLOADING:
      return {
        ...state,
        load: action.payload,
      };
    case types.GETPOSTSUCCESS:
      return {
        ...state,
        getPostLoad: action.payload,
      };
    case types.REPORT:
      return {
        report: action.payload,
      };
    case types.SUSPENDUSERNOTICATION:
      return {
        return: action.payload,
      };
    case types.POSTLIKE:
      return {
        ...state,
        postLike: action.payload,
      };
    case types.COMMENTLIKE:
      return {
        ...state,
        commentLike: action.payload,
      };
    case types.COMMENTSENT:
      return {
        ...state,
        postComment: action.payload,
      };
    case types.ERROR:
      return {
        ...state,
        errorMsg: action.payload,
      };
    // case types.ADDSTORY:
    //   return {
    //     ...state,
    //     story: action.payload,
    //   };
    // case types.STORYLOADDING:
    //   return {
    //     ...state,
    //     storyLoadding: action.payload,
    //   };
    // unused
    case types.GET_GROUP_POST:
      return {
        ...state,
        getGroupData: action.payload,
      };
    case types.GET_GROUP_CHAT_ROOM:
      return {
        ...state,
        getGroupChatRoomData: action.payload,
      };
    case types.GET_GROUP_AUDIO_ROOM:
      return {
        ...state,
        getGroupAudioRoomData: action.payload,
      };
    case types.LOGOUT:
      return {initialState};
    default:
      return state;
  }
};
