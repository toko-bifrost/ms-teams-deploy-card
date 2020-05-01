import { setFailed, ExitCode } from "@actions/core";
import { getOctokitCommit, submitNotification } from "./utils";
import { formatCompactLayout } from "./layouts/compact";

async function run() {
  const commit = await getOctokitCommit();
  const exitCode =
    process.exitCode === ExitCode.Success ? "SUCCESS" : "FAILURE";
  const webhookBody = formatCompactLayout(commit, exitCode);
  submitNotification(webhookBody);
}

try {
  run();
} catch (error) {
  setFailed(error.message);
}
