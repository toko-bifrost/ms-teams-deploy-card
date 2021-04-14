import { setFailed, getInput, info } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  const showCardOnStart = getInput(`show-on-start`).toLowerCase() == "true";
  if (showCardOnStart) {
    info("Show on start")
    formatAndNotify("start");
  } else {
    info("Configured to not show card upon job start.");
  }
} catch (error) {
  setFailed(error.message);
}
