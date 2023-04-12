import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  user: null,
  error: null,
  isLoading: false,
  isLoggedIn: false,
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };

    case "LOG_IN":
      return {
        ...state,
        isLoggedIn: true,
      };

    case "ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "LOG_OUT":
      return {
        ...state,
        isLoggedIn: false,
        user: null,
      };

    case "LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

const persistConfig = {
  key: "root",
  storage,
};

export default persistReducer(persistConfig, userReducer);
