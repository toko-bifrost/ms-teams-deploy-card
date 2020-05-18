import { setFailed } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  formatAndNotify("exit");
} catch (error) {
  setFailed(error.message);
}
