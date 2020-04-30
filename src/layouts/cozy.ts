import { Octokit } from "@octokit/rest";
import moment from "moment-timezone";
import { WebhookBody, CardSection } from "../models";
import { OCTOCAT_LOGO_URL } from "..";

export function formatCozyLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>,
  timezone: string
) {
  const nowFmt = moment()
    .tz(timezone)
    .format("dddd, MMMM Do YYYY, h:mm:ss a z");
  const webhookBody = new WebhookBody();
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const shortSha = process.env.GITHUB_SHA?.substr(0, 7);
  const statusUrl = `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const section: CardSection = {
    activityTitle: `**CI #${process.env.GITHUB_RUN_NUMBER} (commit ${shortSha})** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
    activityImage: commit.data.author.avatar_url || OCTOCAT_LOGO_URL,
    activitySubtitle: `by [@${commit.data.author.login}](${commit.data.author.html_url}) on ${nowFmt}`,
    activityText: `[View status](${statusUrl}) &nbsp; &nbsp; &nbsp; [Review commit diffs](${commit.data.html_url})`,
  };
  webhookBody.sections = [section];
  return webhookBody;
}
