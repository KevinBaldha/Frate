import Toast from 'react-native-simple-toast';
import {API, getAPICall, postAPICall} from '../../Utils/appApi';
// import {getJoinGroupCount} from './userDetails';
import * as types from './ActionsTypes';
import {Alert} from 'react-native';

//get all groups
export const getGroups = (
  grouping,
  category,
  page,
  show_only_friend_groups,
) => {
  return async dispatch => {
    try {
      let groupingFilter = grouping ? '?grouping=' + grouping : 'new';
      let categoryFilter = category ? '&category_id=' + category : '';
      let pageNumber = page ? '&page=' + page : '';
      let showOnlyFriendGroups = show_only_friend_groups
        ? '&show_only_friend_groups=1'
        : '';
      const url =
        API.groupCreate +
        groupingFilter +
        categoryFilter +
        pageNumber +
        showOnlyFriendGroups;
      let success = await getAPICall(url);
      if (success.error) {
      } else {
        dispatch({type: types.GETGROUPS, payload: success});
      }
    } catch (error) {
      console.log('getGroups API catchError ==>>> ', error);
    }
  };
};

export const categoryFilterGroups = payload => {
  console.log('categoryFilterGroups......');
  let categoryFillter =
    payload !== undefined ? '?category_id=' + payload : null;
  return async dispatch => {
    console.log('dispatch ----->');

    try {
      let success = await getAPICall(API.groupCreate + categoryFillter);
      if (success.error) {
      } else {
        dispatch({type: types.GETGROUPS, payload: success.data});
      }
    } catch (error) {
      console.log('categoryFilterGroups API catchError', error);
    }
  };
};
//exit from group
export const exitGroup = payload => {
  console.log('exitGroup INSIDE....');

  return async dispatch => {
    try {
      let formdata = new FormData();
      formdata.append('group_id', payload);
      console.log('formdata -->',formdata);
      let success = await postAPICall(API.leftGroup, formdata);
      console.log('success -->',success);
      console.log('success -->',success.success);
      console.log('success -->',success.message);
      if (success.error) {
      }else{
        console.log('success -->',success.message);
        // getJoinGroupCount(success.data.join_count);
        getJoinedGroups(1);
        dispatch({type: types.LEFTGROUP, payload: success.data});
        dispatch({
          type: types.JOINGROUPCOUNT,
          payload: success.data.join_count,
        });
        Toast.show(success?.message,Toast.BOTTOM);
      }
    } catch (error) {
      console.log('exitGroup API catchError', error);
    }
  };
};

//Manage group notification
export const manageNotification = payload => {
  return async dispatch => {
    try {
      let formdata = new FormData();
      formdata.append('group_id', payload);
      let success = await postAPICall(API.groupNotification, formdata);
      if (success.error) {
        Alert.alert(success.errorMsg);
      } else {
        getGroups(1);
        dispatch({type: types.GROUPNOTIFICATION, payload: success.success});
      }
    } catch (error) {
      console.log('manageNotification API catchError', error);
    }
  };
};

//get joined groups
export const getJoinedGroups = (payload) => {
  console.log('getJoinedGroups ....>>>>');
  console.log('getJoinedGroups ->', payload);

 return async (dispatch) => {
    console.log('Dispatch starting.....');
    try {
      // Log before calling the API
      console.log('Calling getAPICall with endpoint...');

      let success = await getAPICall(API.getJoinGroups + '?page=' + payload);
      console.log('getJoinedGroups success ->', success);

      if (success && success.error) {
        console.error('API responded with an error:', success.error);
      } else if (success) {
        console.log('Dispatching action JOINGROUPS with payload:', success);
        dispatch({ type: types.JOINGROUPS, payload: success });
      } else {
        console.warn('Success response is empty or undefined');
      }

      return success;
    } catch (error) {
      console.error('getJoinedGroups API catchError:', error);
    } finally {
      console.log('Dispatch function completed.');
    }
  };
};

//report group
export const reportGroup = payload => {
  return async dispatch => {
    let groupReport = await postAPICall(API.reportGroup, payload);
    if (groupReport.success) {
      dispatch({type: types.REPORT_GROUP, payload: groupReport});
    } else {
      dispatch({type: types.REPORT_GROUP, payload: null});
      Alert.alert(groupReport?.errorMsg?.message?groupReport?.errorMsg?.message:groupReport?.errorMsg);
    }
  };
};

//report one to one chat
export const reportChat = payload => {
  return async dispatch => {
    let chatReport = await postAPICall(API.chatReportUser, payload);
    if (chatReport.success) {
      dispatch({type: types.REPORT_CHAT, payload: chatReport});
    } else {
      dispatch({type: types.REPORT_CHAT, payload: null});
      Alert.alert(chatReport.errorMsg);
    }
  };
};

// unused code
//stop group notification
export const stopNotification = payload => {
  return async dispatch => {
    let stopNotificationForm = new FormData();
    stopNotificationForm.append('group_id', payload);
    let notificationResponse = await getAPICall(
      API.stopGroupNotification + payload,
    );
    if (notificationResponse.success) {
      Alert.alert(notificationResponse.message);
      dispatch({
        type: types.STOP_GROUP_NOTIFICATION,
        payload: notificationResponse.success,
      });
    } else {
      dispatch({
        type: types.STOP_GROUP_NOTIFICATION,
        payload: notificationResponse.success,
      });
      Alert.alert(notificationResponse.errorMsg);
    }
  };
};

// suspoend room notifications
export const suspendRoomNotication = payload => {
  return async dispatch => {
    try {
      let success = await getAPICall(API.stopRoomNotications + payload);

      if (success.error) {
      } else {
        // alert(success?.message);
        Alert.alert(success?.message);
        dispatch({type: types.SUSPENDROOMNOTIFICATION, payload: success});
      }
    } catch (error) {
      console.log('suspendRoomNotification API catchError', error);
    }
  };
};
