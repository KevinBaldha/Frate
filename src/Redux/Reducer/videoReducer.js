import {ADD_STREAM, MY_STREAM} from '../Actions/ActionsTypes';

const initialState = {myStream: {}, streamData: []};
export default (state = initialState, action) => {
  switch (action.type) {
    case MY_STREAM:
      return {
        ...state,
        myStream: action.payload,
      };
    case ADD_STREAM:
      return {
        ...state,
        streamData: [...state.streamData, action.payload],
      };
    default:
      return state;
  }
};
