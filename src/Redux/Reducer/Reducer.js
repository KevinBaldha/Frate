import * as types from '../Actions/ActionsTypes';

const initialState = {
  login: false,
  firstTimeInstall: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case types.ISLOGIN:
      return {
        ...state,
        login: action.payload,
      };
    case types.LOGOUT:
      return {
        initialState,
      };
    case types.FIRST_TIME_INSTALL:
      return {
        ...state,
        firstTimeInstall: action.payload,
      };
    default:
      return state;
  }
};
