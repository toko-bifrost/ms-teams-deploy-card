import { Octokit } from "@octokit/rest";
import moment from "moment-timezone";
import { WebhookBody } from "../models";
import { getInput } from "@actions/core";

export const OCTOCAT_LOGO_URL =
  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

export function formatCozyLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>,
  status = "STARTED",
  elapsedSeconds?: number
) {
  const timezone = getInput("timezone") || "UTC";
  const nowFmt = moment()
    .tz(timezone)
    .format("dddd, MMMM Do YYYY, h:mm:ss a z");
  const webhookBody = new WebhookBody();
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const shortSha = process.env.GITHUB_SHA?.substr(0, 7);
  const statusUrl = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;

  if (elapsedSeconds) {
    status += `[${elapsedSeconds} seconds]`;
  }

  webhookBody.sections = [
    {
      activityTitle: `**CI #${process.env.GITHUB_RUN_NUMBER} (commit ${shortSha})** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
      activityImage: commit.data.author.avatar_url || OCTOCAT_LOGO_URL,
      activitySubtitle: `by [@${commit.data.author.login}](${commit.data.author.html_url}) on ${nowFmt}`,
      activityText: `\`${status}\`\ &nbsp; &nbsp; [View status](${statusUrl}) &nbsp; &nbsp; [Review diffs](${commit.data.html_url})`,
    },
  ];
  return webhookBody;
}
