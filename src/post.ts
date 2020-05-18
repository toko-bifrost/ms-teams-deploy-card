import { setFailed } from "@actions/core";
import { formatAndNotify } from "./utils";

try {
  setTimeout(() => {
    formatAndNotify("exit");
  }, 2000);
} catch (error) {
  setFailed(error.message);
}
