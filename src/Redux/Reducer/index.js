import {combineReducers} from 'redux';
import AppReducer from './Reducer';
import UserInfo from './UserReducer';
import PostReducer from './PostReducer';
import groupsReducer from './groupsReducer';
import videoReducer from './videoReducer';
import NetinfoReducer from './NetinfoReducer';

const Reducers = combineReducers({
  AppReducer,
  UserInfo,
  PostReducer,
  groupsReducer,
  videoReducer,
  NetinfoReducer,
});

export default Reducers;
