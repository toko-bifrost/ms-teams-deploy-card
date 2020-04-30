import { getInput, setFailed, setOutput, info } from "@actions/core";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import { WebhookBody } from "./models";
import { formatCompactLayout } from "./layouts/compact";
import { formatCozyLayout } from "./layouts/cozy";
import { formatCompleteLayout } from "./layouts/complete";
import { getRunInformation } from "./utils";

export const OCTOCAT_LOGO_URL =
  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

const run = async () => {
  const githubToken = getInput("github-token", { required: true });
  const webhookUri = getInput("webhook-uri", { required: true });
  const timezone = getInput("timezone") || "UTC";
  const layout = getInput("layout") || "complete";
  const includeFiles =
    getInput("include-files").trim().toLowerCase() === "true";
  const allowedFileLen = getInput("allowed-file-len").toLowerCase();
  const allowedFileLenParsed = parseInt(
    allowedFileLen === "" ? "7" : allowedFileLen
  );

  const runInfo = getRunInformation();
  info("Workflow run information: " + JSON.stringify(runInfo, undefined, 2));

  const octokit = new Octokit({ auth: `token ${githubToken}` });
  const commit = await octokit.repos.getCommit({
    owner: runInfo.owner,
    repo: runInfo.repo,
    ref: runInfo.ref || "",
  });

  let webhookBody: WebhookBody;
  if (layout === "compact") {
    webhookBody = formatCompactLayout(commit);
  } else if (layout === "cozy") {
    webhookBody = formatCozyLayout(commit, timezone);
  } else {
    // for complete layout
    webhookBody = formatCompleteLayout(
      commit,
      timezone,
      includeFiles,
      allowedFileLenParsed
    );
  }

  const webhookBodyJson = JSON.stringify(webhookBody, undefined, 2);
  fetch(webhookUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: webhookBodyJson,
  })
    .then(() => {
      setOutput("webhook-body", webhookBodyJson);
      info(webhookBodyJson);
    })
    .catch(console.error);
};

try {
  run();
} catch (error) {
  setFailed(error.message);
}
