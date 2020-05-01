import { Octokit } from "@octokit/rest";
import { escapeMarkdownTokens, formatFilesToDisplay } from "../utils";
import { Fact, PotentialAction } from "../models";
import { formatCozyLayout } from "./cozy";
import { getInput } from "@actions/core";

export function formatCompleteLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>
) {
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const branchUrl = `${repoUrl}/tree/${process.env.GITHUB_REF}`;
  const webhookBody = formatCozyLayout(commit);
  const section = webhookBody.sections[0];

  // for complete layout, just replace activityText with potentialAction
  section.activityText = undefined;
  section.potentialAction = [
    new PotentialAction("View build/deploy status", [
      `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    ]),
    new PotentialAction("Review commit diffs", [commit.data.html_url]),
  ];

  section.facts = [
    new Fact(
      "Event type:",
      "`" + process.env.GITHUB_EVENT_NAME?.toUpperCase() + "`"
    ),
    new Fact(
      "Commit message:",
      escapeMarkdownTokens(commit.data.commit.message)
    ),
    new Fact("Repository & branch:", `[${branchUrl}](${branchUrl})`),
  ];

  const includeFiles =
    getInput("include-files").trim().toLowerCase() === "true";
  if (includeFiles) {
    const allowedFileLen = getInput("allowed-file-len").toLowerCase();
    const allowedFileLenParsed = parseInt(
      allowedFileLen === "" ? "7" : allowedFileLen
    );
    const filesToDisplay = formatFilesToDisplay(
      commit.data.files,
      allowedFileLenParsed,
      commit.data.html_url
    );
    section.facts?.push({
      name: "Files changed:",
      value: filesToDisplay,
    });
  }

  return webhookBody;
}
