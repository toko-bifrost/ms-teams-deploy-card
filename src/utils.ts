import { Octokit } from "@octokit/rest";

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
