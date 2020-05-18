import { setFailed } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  formatAndNotify("start");
} catch (error) {
  setFailed(error.message);
}
