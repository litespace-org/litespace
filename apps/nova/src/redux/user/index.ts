import me from "@/redux/user/me";
import tutor from "@/redux/user/tutor";
import schedule from "@/redux/user/schedule";
import { combineReducers } from "@reduxjs/toolkit";

export default combineReducers({
  me,
  tutor,
  schedule,
});
