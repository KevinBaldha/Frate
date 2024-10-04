import * as types from './ActionsTypes';

export const changeNetStatus = (status) => {
  return async (dispatch) => {
    try {
      dispatch({type: types.NETINFO_STATUS, payload: status});
    } catch (error) {
      console.log('NetStatus catchError', error);
    }
  };
};
