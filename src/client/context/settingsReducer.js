import * as ACTIONS from '../constants/actions'

const settingsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SELECT_UNITS:
      return {
        ...state,
        ...{
          units: action.payload
        }
      };
    case ACTIONS.SELECT_THEME:
      return {
        ...state,
        ...{
          theme: action.payload
        }
      };
    case ACTIONS.SELECT_CALENDAR:
      return {
        ...state,
        ...{
          calendarType: action.payload
        }
      };
    case ACTIONS.TOGGLE_CACHE:
      return {
        ...state,
        ...{
          cache: action.payload
        }
      };
    default:
      return state;
  }
};

export default settingsReducer;