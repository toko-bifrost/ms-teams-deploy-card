import { Octokit } from "@octokit/rest";
import { setOutput, info, getInput, warning } from "@actions/core";
import fetch, { Response } from "node-fetch";
import moment from "moment";
import yaml from "yaml";

import { WebhookBody, PotentialAction } from "./models";
import { formatCompactLayout } from "./layouts/compact";
import { formatCozyLayout } from "./layouts/cozy";
import { formatCompleteLayout } from "./layouts/complete";
import { CONCLUSION_THEMES } from "./constants";
import { Collection } from "yaml/types";

export function escapeMarkdownTokens(text: string) {
  return text
    .replace(/\n\ {1,}/g, "\n ")
    .replace(/\_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/\|/g, "\\|")
    .replace(/#/g, "\\#")
    .replace(/-/g, "\\-")
    .replace(/>/g, "\\>");
}

export function getRunInformation() {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
  return {
    owner,
    repo,
    ref: process.env.GITHUB_SHA || undefined,
    branchUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}/tree/${process.env.GITHUB_REF}`,
    runId: process.env.GITHUB_RUN_ID || undefined,
    runNum: process.env.GITHUB_RUN_NUMBER || undefined,
  };
}

export async function getOctokitCommit() {
  const runInfo = getRunInformation();
  info("Workflow run information: " + JSON.stringify(runInfo, undefined, 2));

  const githubToken = getInput("github-token", { required: true });
  const octokit = new Octokit({ auth: `token ${githubToken}` });

  return await octokit.repos.getCommit({
    owner: runInfo.owner,
    repo: runInfo.repo,
    ref: runInfo.ref || "",
  });
}

export function submitNotification(webhookBody: WebhookBody) {
  const webhookUri = getInput("webhook-uri", { required: true });
  const webhookBodyJson = JSON.stringify(webhookBody, undefined, 2);

  return fetch(webhookUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: webhookBodyJson,
  })
    .then((response: Response) => {
      setOutput("webhook-body", webhookBodyJson);
      info(webhookBodyJson);
      return response;
    })
    .catch(console.error);
}

export async function formatAndNotify(
  state: "start" | "exit",
  conclusion = "in_progress",
  elapsedSeconds?: number
) {
  let webhookBody: WebhookBody;
  const commit = await getOctokitCommit();
  const cardLayoutStart = getInput(`card-layout-${state}`);

  if (cardLayoutStart === "compact") {
    webhookBody = formatCompactLayout(commit, conclusion, elapsedSeconds);
  } else if (cardLayoutStart === "cozy") {
    webhookBody = formatCozyLayout(commit, conclusion, elapsedSeconds);
  } else {
    webhookBody = formatCompleteLayout(commit, conclusion, elapsedSeconds);
  }

  submitNotification(webhookBody);
}

export async function getWorkflowRunStatus() {
  info ("Init get Workflow status")
  const runInfo = getRunInformation();
  const githubToken = getInput("github-token", { required: true });
  const octokit = new Octokit({ auth: `token ${githubToken}` });
  const workflowJobs = await octokit.actions.listJobsForWorkflowRun({
    owner: runInfo.owner,
    repo: runInfo.repo,
    run_id: parseInt(runInfo.runId || "1"),
  });

  let currentStatus: Octokit.ActionsListJobsForWorkflowRunResponseJobsItemStepsItem
  let jobStartDate = "dummy"
  let jobCompleteDate = "dummy"

  /**
   * We have to verify all jobs steps. We don't know
   * if users are using multiple jobs or not. Btw,
   * we don't need to check if GITHUB_JOB env is the 
   * same of the Octokit job name, because it is different.
   * 
   * @note We are using a quadratic way to search all steps.
   * But we have just a few elements, so this does not 
   * a performance issue
   * 
   * The conclusion steps, in accordance the documentation, are:
   * <success>, <cancelled>, <failure> and <skipped>
   */
  const jobs = workflowJobs.data.jobs.forEach (job => {
    let currentJobStep = job.steps.forEach( step => {
      // the conclusion are null when the step still running
      if (step?.conclusion !== null && step.completed_at !== null) {
        info(`Step name: ${step.name}`)
        info(`Step conclusion: ${step.conclusion}`)
        info (`Start date = ${job.started_at}`)
        info (`End date = ${job.completed_at}`)

        currentStatus = step
        jobStartDate = job.started_at
        jobCompleteDate = step.completed_at

        // Some job has failed. Get out from here.
        if (step?.conclusion !== "success" && step?.conclusion !== "skipped") {
          return undefined
        }
      }
      /**  
       * If nothing has failed, so we have a success scenario
       * @note avoiding skipped cases. 
       */
      currentStatus.conclusion = "success"
    })

    if(currentJobStep === undefined) {
      return null
    }
  })

  info(`Job start date ${jobStartDate}`)
  info(`Job End date ${jobCompleteDate}`)
  info(`Conclusion ${currentStatus!!.conclusion}`)
  const startTime = moment(jobStartDate, moment.ISO_8601);
  const endTime = moment(jobCompleteDate, moment.ISO_8601);  
  return {
    elapsedSeconds: endTime.diff(startTime, "seconds"),
    conclusion: currentStatus!!.conclusion,
  };
}

export function renderActions(statusUrl: string, diffUrl: string) {
  const actions: PotentialAction[] = [];
  if (getInput("enable-view-status-action").toLowerCase() === "true") {
    actions.push(
      new PotentialAction(getInput("view-status-action-text"), [statusUrl])
    );
  }
  if (getInput("enable-review-diffs-action").toLowerCase() === "true") {
    actions.push(
      new PotentialAction(getInput("review-diffs-action-text"), [diffUrl])
    );
  }

  // Set custom actions
  const customActions = getInput("custom-actions");
  if (customActions && customActions.toLowerCase() !== "null") {
    try {
      let customActionsCounter = 0;
      const customActionsList = yaml.parse(customActions);
      if (Array.isArray(customActionsList)) {
        (customActionsList as any[]).forEach((action) => {
          if (
            action.text !== undefined &&
            action.url !== undefined &&
            (action.url as string).match(/https?:\/\/\S+/g)
          ) {
            actions.push(new PotentialAction(action.text, [action.url]));
            customActionsCounter++;
          }
        });
      }
      info(`Added ${customActionsCounter} custom facts.`);
    } catch {
      warning("Invalid custom-actions value.");
    }
  }
  return actions;
}