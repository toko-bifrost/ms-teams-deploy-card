import { Octokit } from "@octokit/rest";
import { setOutput, info, getInput, getState } from "@actions/core";
import fetch, { Response } from "node-fetch";
import moment from "moment";

import { WebhookBody } from "./models";
import { formatCompactLayout } from "./layouts/compact";
import { formatCozyLayout } from "./layouts/cozy";
import { formatCompleteLayout } from "./layouts/complete";

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
    ref: process.env.GITHUB_SHA,
    branchUrl: `https://github.com/${process.env.GITHUB_REPOSITORY}/tree/${process.env.GITHUB_REF}`,
    runId: process.env.GITHUB_RUN_ID,
    runNum: process.env.GITHUB_RUN_NUMBER,
  };
}

export function formatFilesToDisplay(
  files: Octokit.ReposGetCommitResponseFilesItem[],
  allowedLength: number,
  htmlUrl: string
) {
  const filesChanged = files
    .slice(0, allowedLength)
    .map(
      (file: any) =>
        `[${escapeMarkdownTokens(file.filename)}](${file.blob_url}) (${
          file.changes
        } changes)`
    );

  let filesToDisplay = "";
  if (files.length === 0) {
    filesToDisplay = "*No files changed.*";
  } else {
    filesToDisplay = "* " + filesChanged.join("\n\n* ");
    if (files.length > 7) {
      const moreLen = files.length - 7;
      filesToDisplay += `\n\n* and [${moreLen} more files](${htmlUrl}) changed`;
    }
  }

  return filesToDisplay;
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

export async function formatAndNotify(state: "start" | "exit") {
  const showCard = getInput(`show-on-${state}`).trim() == "true";

  if (showCard) {
    let webhookBody: WebhookBody;
    const commit = await getOctokitCommit();
    const cardLayoutStart = getInput(`card-layout-${state}`);

    const startTime = moment(getState("startTime"));
    let status, elapsedSeconds;

    if (state === "exit") {
      status = "COMPLETED";
      elapsedSeconds = moment().diff(startTime, "seconds");
    }

    if (cardLayoutStart === "compact") {
      webhookBody = formatCompactLayout(commit, status, elapsedSeconds);
    } else if (cardLayoutStart === "cozy") {
      webhookBody = formatCozyLayout(commit, status, elapsedSeconds);
    } else {
      // for complete layout
      webhookBody = formatCompleteLayout(commit, status, elapsedSeconds);
    }

    submitNotification(webhookBody);
  } else {
    info(`Configured to not show card upon job ${state}.`);
  }
}
