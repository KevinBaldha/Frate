import * as types from './ActionsTypes';

export const userData = (payload) => {
  return {
    type: types.USERDETAILS,
    payload,
  };
};
// notificaiton preferences of user
export const userPreferences = (payload) => {
  return {
    type: types.USER_PREFERENCES,
    payload,
  };
};
//total join group of login user
export const getJoinGroupCount = (payload) => {
  return {
    type: types.JOINGROUPCOUNT,
    payload,
  };
};

//total created group of login user
export const CreatedGroupCount = (payload) => {
  return {
    type: types.CREATEDGROUPCOUNT,
    payload,
  };
};

//set cover image
export const setCoverImage = (payload) => {
  return {
    type: types.COVER_IMAGE_SET,
    payload,
  };
};

//set notification bell icon
export const setNotificationBellIcon = (payload) => {
  return {
    type: types.GET_NOTIFICATION_BELL,
    payload,
  };
};

//set new post badge icon
export const setNewPostBadge = (payload) => {
  return {
    type: types.GET_NEWPOST_BADGE,
    payload,
  };
};

//set new chat badge icon
export const setNewChatBadge = (payload) => {
  return {
    type: types.GET_NEWCHAT_BADGE,
    payload,
  };
};
