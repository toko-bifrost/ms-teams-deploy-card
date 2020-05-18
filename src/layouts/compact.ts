import { Octokit } from "@octokit/rest";
import { WebhookBody } from "../models";

export function formatCompactLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>,
  status: string,
  elapsedSeconds?: number
) {
  const author = commit.data.author;
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const shortSha = process.env.GITHUB_SHA?.substr(0, 7);
  const runLink = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const webhookBody = new WebhookBody();

  console.log(elapsedSeconds);
  if (elapsedSeconds) {
    status += ` [${elapsedSeconds}]`;
    console.log(status);
  }

  webhookBody.text =
    `\`${status}\` &nbsp; CI [#${process.env.GITHUB_RUN_NUMBER}](${runLink}) ` +
    `(commit [${shortSha}](${commit.data.html_url})) on [${process.env.GITHUB_REPOSITORY}](${repoUrl}) ` +
    `by [@${author.login}](${author.html_url})`;
  return webhookBody;
}
