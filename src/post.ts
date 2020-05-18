import { setFailed, getInput } from "@actions/core";
import { formatAndNotify, getRunInformation } from "./utils";
import { Octokit } from "@octokit/rest";

try {
  // const runInfo = getRunInformation();
  // const githubToken = getInput("github-token", { required: true });
  // const octokit = new Octokit({ auth: `token ${githubToken}` });
  // const workflowJob = await octokit.actions.getWorkflowJob({
  //   owner: runInfo.owner,
  //   repo: runInfo.repo,
  //   job_id: runInfo.,
  // });
  formatAndNotify("exit");
  console.log(process.env);
} catch (error) {
  setFailed(error.message);
}
