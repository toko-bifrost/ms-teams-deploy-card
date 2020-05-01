import { setFailed, info } from "@actions/core";

function run() {
  info("This runs ins post.");
}

try {
  run();
} catch (error) {
  setFailed(error.message);
}
