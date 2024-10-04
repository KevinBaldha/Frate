import * as types from './ActionsTypes';

export const isLogin = (payload) => {
  return {
    type: types.ISLOGIN,
    payload,
  };
};

export const setUserPreferences = (payload) => {
  return {
    type: types.USER_PREFERENCES,
    payload,
  };
};

export const logout = () => {
  return {
    type: types.LOGOUT,
  };
};

//natication token exist or not
export const firstTimeInstallApp = (payload) => {
  return {
    type: types.FIRST_TIME_INSTALL,
    payload,
  };
};
