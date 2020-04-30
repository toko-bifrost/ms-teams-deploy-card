import { Octokit } from "@octokit/rest";
import { escapeMarkdownTokens, formatFilesToDisplay } from "../utils";
import { CardSection, Fact } from "../models";
import { formatCozyLayout } from "./cozy";

export function formatCompleteLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>,
  timezone: string,
  includeFiles: boolean,
  allowedFileLenParsed: number
) {
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const branchUrl = `${repoUrl}/tree/${process.env.GITHUB_REF}`;
  const webhookBody = formatCozyLayout(commit, timezone);
  webhookBody.sections[0].facts = [
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

  if (includeFiles) {
    const filesToDisplay = formatFilesToDisplay(
      commit.data.files,
      allowedFileLenParsed,
      commit.data.html_url
    );
    webhookBody.sections[0].facts?.push({
      name: "Files changed:",
      value: filesToDisplay,
    });
  }

  return webhookBody;
}
