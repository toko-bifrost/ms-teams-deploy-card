import { Octokit } from "@octokit/rest";
import { getInput, warning, info } from "@actions/core";
import yaml from "yaml";

import { escapeMarkdownTokens, renderActions } from "../utils";
import { Fact, PotentialAction } from "../models";
import { formatCozyLayout } from "./cozy";

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

export function formatCompleteLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>,
  conclusion: string,
  elapsedSeconds?: number
) {
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const branchUrl = `${repoUrl}/tree/${process.env.GITHUB_REF}`;
  const webhookBody = formatCozyLayout(commit, conclusion, elapsedSeconds);
  const section = webhookBody.sections[0];

  // for complete layout, just replace activityText with potentialAction
  section.activityText = undefined;
  section.potentialAction = renderActions(
    `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    commit.data.html_url
  );

  var iconToAppend = "";
  // Set status and elapsedSeconds
  if (conclusion.toLocaleUpperCase() === "FAILURE") {
    iconToAppend = "(noentry) 	\xE2\x9C\x85 \xE2\x9D\x8C";
  } else if (conclusion.toLocaleUpperCase() === "SUCCESS") {
    iconToAppend = "(checkmarkbutton) 	\xE2\x9C\x85 \xE2\x9D\x8C";
  }
  let labels = `\`${conclusion.toUpperCase()}\``;
  if (elapsedSeconds) {
    labels = `\`${conclusion.toUpperCase()} [${elapsedSeconds}s] ${iconToAppend}\``;
  }

  // Set section facts
  section.facts = [
    new Fact("Status:", labels),
    new Fact(
      "Commit message:",
      escapeMarkdownTokens(commit.data.commit.message)
    ),
    new Fact("Repository & branch:", `[${branchUrl}](${branchUrl})`),
  ];

  // Set custom facts
  const customFacts = getInput("custom-facts");
  if (customFacts && customFacts.toLowerCase() !== "null") {
    try {
      let customFactsCounter = 0;
      const customFactsList = yaml.parse(customFacts);
      if (Array.isArray(customFactsList)) {
        (customFactsList as any[]).forEach((fact) => {
          if (fact.name !== undefined && fact.value !== undefined) {
            section.facts?.push(new Fact(fact.name + ":", fact.value));
            customFactsCounter++;
          }
        });
      }
      info(`Added ${customFactsCounter} custom facts.`);
    } catch {
      warning("Invalid custom-facts value.");
    }
  }

  // Set environment name
  const environment = getInput("environment");
  if (environment !== "") {
    section.facts.splice(
      1,
      0,
      new Fact("Environment:", `\`${environment.toUpperCase()}\``)
    );
  }

  // Set list of files
  if (getInput("include-files").toLowerCase() === "true") {
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
