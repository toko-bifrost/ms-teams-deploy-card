import { setFailed, info, getInput } from "@actions/core";
import { formatAndNotify, getWorkflowRunStatus } from "./utils";

try {
  setTimeout(async () => {
    const showCardOnExit =
      getInput(`show-on-exit`).trim().toLowerCase() == "true";
    const showCardOnFailure =
      getInput(`show-on-failure`).trim().toLowerCase() == "true";

    const workflowRunStatus = await getWorkflowRunStatus();
    if (
      showCardOnExit ||
      (showCardOnFailure && workflowRunStatus.status !== "COMPLETED")
    ) {
      formatAndNotify(
        "exit",
        workflowRunStatus.status,
        workflowRunStatus.elapsedSeconds
      );
    } else {
      info(`Configured to not show card upon job exit.`);
    }
  }, 2000);
} catch (error) {
  setFailed(error.message);
}
