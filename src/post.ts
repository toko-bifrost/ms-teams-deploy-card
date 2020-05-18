import { setFailed, getInput } from "@actions/core";
import { formatAndNotify, getRunInformation } from "./utils";
import { Octokit } from "@octokit/rest";

async function getWorkflowRunStatus() {
  const runInfo = getRunInformation();
  const githubToken = getInput("github-token", { required: true });
  const octokit = new Octokit({ auth: `token ${githubToken}` });
  const workflowJobs = await octokit.actions.listJobsForWorkflowRun({
    owner: runInfo.owner,
    repo: runInfo.repo,
    run_id: parseInt(runInfo.runId || "1"),
  });
  console.log(workflowJobs.data.jobs[0].steps);
}

try {
  getWorkflowRunStatus();
  formatAndNotify("exit");
} catch (error) {
  setFailed(error.message);
}
