import * as types from '../Actions/ActionsTypes';

const initialState = {
  data: [],
  userToken: '',
  joinGroupCount: '',
  creaetedGroupCount: '',
  notificationBellIcon: false,
  coverImagePath: '',
  newPostBadge: false,
  newChatBadge: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.USERDETAILS:
      return {
        ...state,
        data: action.payload,
      };
    case types.USER_PREFERENCES:
      return {
        ...state,
        userPreferences: action.payload,
      };
    case types.JOINGROUPCOUNT:
      return {
        ...state,
        joinGroupCount: action.payload,
      };
    case types.CREATEDGROUPCOUNT:
      return {
        ...state,
        creaetedGroupCount: action.payload,
      };
    case types.COVER_IMAGE_SET:
      return {
        ...state,
        coverImagePath: action.payload,
      };
    case types.GET_NOTIFICATION_BELL:
      return {
        ...state,
        notificationBellIcon: action.payload,
      };
    case types.GET_NEWPOST_BADGE:
      return {
        ...state,
        newPostBadge: action.payload,
      };
    case types.GET_NEWCHAT_BADGE:
      return {
        ...state,
        newChatBadge: action.payload,
      };
    case types.LOGOUT:
      return {data: []};
    default:
      return state;
  }
};
