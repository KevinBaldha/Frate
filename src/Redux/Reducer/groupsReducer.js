import * as types from '../Actions/ActionsTypes';

const initialState = {
  group_list: [],
  joinGroup_list: [],
  joinGroupTotalPage: '',
  joinGroupCurrentPage: '',
  leaveGroup: '',
  groupNotication: '',
  stopGroupNotification: '',
  roomNotication: '',
  reportGroupPayload: null,
  reportChatPayload: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.GETGROUPS:
      return {
        ...state,
        group_list: action.payload,
      };
    case types.JOINGROUPS:
      return {
        ...state,
        joinGroup_list: action.payload.data,
        joinGroupTotalPage: action.payload.total_page,
        joinGroupCurrentPage: action.payload.current_page,
      };
    case types.LEFTGROUP:
      return {
        ...state,
        leaveGroup: '',
      };
    case types.STOP_GROUP_NOTIFICATION:
      return {
        ...state,
        stopGroupNotification: action.payload,
      };
    case types.GROUPNOTIFICATION:
      return {
        ...state,
        groupNotication: action.payload,
      };
    case types.SUSPENDROOMNOTIFICATION:
      return {
        ...state,
        roomNotication: action.payload,
      };
    case types.REPORT_GROUP:
      return {
        ...state,
        reportGroupPayload: action.payload,
      };
    case types.REPORT_CHAT:
      return {
        ...state,
        reportChatPayload: action.payload,
      };
    case types.LOGOUT:
      return {group_list: []};
    default:
      return state;
  }
};
