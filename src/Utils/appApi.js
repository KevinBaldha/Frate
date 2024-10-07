import axios from 'axios';
import I18n from 'i18n-js';
import {handleError, handleResponse} from './helper';

export const getBaseUrl = () => {
  if (I18n.locale === 'fr') {
    return 'https://frate.eugeniuses.com/api/fr/';
  } else {
    return 'https://frate.eugeniuses.com/api/en/';
  }
};

export const appAPI = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

export const baseUrlForShare = 'https://Frate.com/post?=';
export const GOOGLEWEBCLIENTID =
  '1029252269707-7djm8tkl1eeud3m8li3laaqheo743htf.apps.googleusercontent.com';
export const baseUrl_chat = 'https://frate.eugeniuses.com:3030/data/';
export const API = {
  login: 'login',
  forgotPassword: 'password/forgot',
  logOut: 'logout',
  signUp: 'signup',
  post: 'post',
  getSponsorPost: 'post/sponsor-post-list?page=',
  category: 'category',
  contentPage: 'get-page? name=',
  user: 'user/',
  passwordReset: 'password-reset',
  userPost: 'post/user-post',
  postLike: 'post/like',
  commentLike: 'post/comment-like',
  comment: 'post/comment',
  apiteam: 'team?city_id=',
  postHide: 'post-hide',
  postSave: 'post-save',
  getSavePost: 'post/saved-post',
  getHidePost: 'post/get-hidepost',
  groupCreate: 'group',
  getSingleGroup: 'group/',
  getSingleRoom: 'room/room-detail/',
  groupJoin: 'group/join',
  getJoinGroups: 'group/joined-group',
  leftGroup: 'group/exit',
  roomExit: 'room/exit-room',
  groupMembers: 'group/members/',
  groupNotification: 'group/notification',
  intraction: 'post/intraction',
  intractionDetails: 'post/intraction-detail/',
  blockUser: 'group/report-user',
  reportGroup: 'group/report-group',
  blockUserList: 'group/blocked-user-list?group_id=',
  getGroupPost: 'post/user-group-post/',
  postsMedia: 'post/get-userpostimages/',
  // poststatisticst: 'post/get-poststatistics/',
  getComments: 'post/get-comments/',
  getLikes: 'post/get-likes/',
  updateProfile: 'update-profile/',
  userJoinRequest: 'group/user-request',
  groupJoinRequest: 'group/update-request',
  reportedList: 'group/reported-list',
  updateReportStatus: 'group/report-status',
  makeAdmin: 'group/make-admin',
  search: 'search',
  createRoom: 'room/create-room',
  roomList: 'room/room-list', //group chat list and audio chat list
  chathistory: 'room/room-history/',
  lastGroupChatId: 'room/last-message/',
  getSinglePost: 'post/get-post/',
  suspendUserNotication: 'group/block-user-notification',
  // makeSponsor: 'post/update-post', //unused
  // stopGroupNotification: 'group/block-group-notification/',
  addCardDetails: 'profile/card/create',
  getAllCards: 'profile/card',
  updateCardStatus: 'profile/card/update-status',
  updateCardDetails: 'profile/card/update',
  getPostStatics: 'post/post-user-statistics/',
  getAllNotifications: 'notification/notification-list/',
  stopRoomNotications: 'room/room-notification/',
  sendFriendReq: 'friend/send-friend-request/',
  undoReq: 'friend/delete-friend-request/',
  readNotification: 'notification/read-notification/',
  // addStory: 'story/create-story', // unused
  friendReqList: 'friend/get-pending-friend-request',
  friendrequestUpdate: 'friend/friend-request-action',
  friendList: 'friend/get-friend-list',
  // storyList: 'story/story-list/', // unused
  roomDetails: 'room/room-detail/', //audio details
  updateMessageStatus: 'room/update-message-read-status',
  reshare: 'post/reshare-post/',
  reshared: 'post/reshared-post/',
  deletePost: 'post/delete-post/',
  groupMedia: 'room/room-media-list',
  deletePostComment: 'post/delete-post-comment/',
  getMySponsorPosts: 'post/my-sponsor-post-list?page=',
  updateComment: 'post/edit-comment',
  reportComment: 'post/report-post-comment/',
  chat: 'chat/',
  getChatHistory: 'chat/history',
  userPreference: 'user-preferance',
  updateChatStatusOnetoOne: 'chat/read-status',
  suspendPrivateMsg: 'chat/notification-preference/',
  privateChatMedia: 'chat/media-list',
  makeSponsorPostNew: 'post/make-sponsored-post',
  getSponsorAlert: 'post/sponsor-alerts',
  sponsorPostStatus: 'post/sponsor-post-action',
  updateNotificationFlag: 'update-notification-flag',
  getNotificationFlag: 'get-notification-flag',
  getReportReasonList: 'reason-list',
  chatReportUser: 'chat/report-user',
  removeUserFromGroup: 'group/remove-user',
  postGroupMedia: 'group/media-list',
  getContinents: 'get-continents',
  getCountries: 'get-countries/',
  getCities: 'get-cities/',
  getStoreUserLog: 'post/store/user-logs',
  getSponsorCalculation: '/post/sponsor-post-action-calculation',
  getRestPasswordToken: 'password/get-reset-token',
  setRestPasswordToken: 'password/reset-pass',
  removeProfile: 'user-remove-profile',
};

export const getAPICall = (url, startOffset, size = 5, isDiscount) => {
  return appAPI
    .get(url, {params: {offset: startOffset, size, discounted: isDiscount}})
    .then((res) => {
      return handleResponse(res);
    })
    .catch((e) => {
      if (e.response) {
        return handleError(e.response.data);
      }
      // else if (e?.status === undefined) {
      //   return null;
      // }
      return handleError(e.message);
    });
};

export const postAPICall = (url, requestData) => {
  return appAPI
    .post(url, requestData)
    .then((res) => {
      return handleResponse(res);
    })
    .catch((e) => {
      if (e.response) {
        // if (e.response.data && e.response.data.errors.email) {
        //   return handleError(e.response.data.errors.email);
        // }
        return handleError(e.response.data.message);
        // } else if (e?.status === undefined) {
        //   return null;
      } else {
        return handleError(e.message);
      }
    });
};
export const putAPICall = (url, requestData) => {
  return appAPI
    .put(url, requestData)
    .then((res) => {
      return handleResponse(res);
    })
    .catch((e) => {
      if (e.response) {
        return handleError(e.response.data.message);
      }
      // else if (e?.status === undefined) {
      //   return null;
      // }
      else {
        return handleError(e.message);
      }
    });
};
export const deleteAPICall = (url) => {
  return appAPI
    .delete(url)
    .then((res) => {
      return handleResponse(res);
    })
    .catch((e) => {
      if (e.response) {
        return handleError(e.response.data.message);
      }
      // else if (e?.status === undefined) {
      //   return null;
      // }
      else {
        return handleError(e.message);
      }
    });
};