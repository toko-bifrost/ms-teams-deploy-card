import { setFailed, saveState, getState } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  formatAndNotify("start");
  saveState("startTime", new Date().toUTCString());
  console.log(process.env.STATE_startTime);
  console.log(new Date().toUTCString(), getState("startTime"));
} catch (error) {
  setFailed(error.message);
}
