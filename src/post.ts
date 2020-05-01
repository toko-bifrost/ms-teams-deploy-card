import { setFailed } from "@actions/core";
import { getOctokitCommit, submitNotification } from "./utils";
import { formatCompactLayout } from "./layouts/compact";

async function run() {
  const commit = await getOctokitCommit();
  const webhookBody = formatCompactLayout(commit, "COMPLETED");
  submitNotification(webhookBody);
}

try {
  run();
} catch (error) {
  setFailed(error.message);
}
