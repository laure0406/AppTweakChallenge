import { combineReducers } from "redux";

import authentication from "../containers/auth/slice";
import api from "../api/apiSlice";

const rootReducer = combineReducers({
  authentication,
  api,
});
export default rootReducer;