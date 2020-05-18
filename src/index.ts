import { setFailed, saveState, getState } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  formatAndNotify("start");
  saveState("startTime", new Date());
  console.log(getState("startTime"));
} catch (error) {
  setFailed(error.message);
}
