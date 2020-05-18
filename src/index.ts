import { setFailed, saveState } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  formatAndNotify("start");
  saveState("startTime", new Date());
} catch (error) {
  setFailed(error.message);
}
