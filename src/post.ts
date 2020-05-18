import { setFailed, getInput } from "@actions/core";
import { formatAndNotify, getRunInformation } from "./utils";
import { Octokit } from "@octokit/rest";

async function getWorkflowRunStatus() {
  const runInfo = getRunInformation();
  const githubToken = getInput("github-token", { required: true });
  const octokit = new Octokit({ auth: `token ${githubToken}` });
  const workflowJob = await octokit.actions.getWorkflowRun({
    owner: runInfo.owner,
    repo: runInfo.repo,
    run_id: parseInt(runInfo.runId || "1"),
  });
  console.log(workflowJob);
}

try {
  getWorkflowRunStatus();
  formatAndNotify("exit");
  console.log(process.env);
} catch (error) {
  setFailed(error.message);
}
