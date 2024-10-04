import * as types from '../Actions/ActionsTypes';

const initialState = {
  isNetConnected: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.NETINFO_STATUS:
      return {
        ...state,
        isNetConnected: action.payload,
      };

    default:
      return state;
  }
};
