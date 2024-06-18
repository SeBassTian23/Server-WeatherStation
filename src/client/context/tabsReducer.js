import * as ACTIONS from '../constants/actions'

const tabsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SELECT_TAB:
      return {
        ...state,
        ...{
          tab: action.payload
        }
      };
    default:
      return state;
  }
};

export default tabsReducer;