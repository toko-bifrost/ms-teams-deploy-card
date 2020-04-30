import { Octokit } from "@octokit/rest";
import moment from "moment-timezone";
import { WebhookBody, CardSection, PotentialAction } from "../models";

const OCTOCAT_LOGO_URL =
  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

export function formatCozyLayout(
  commit: Octokit.Response<Octokit.ReposGetCommitResponse>,
  timezone: string
) {
  const nowFmt = moment()
    .tz(timezone)
    .format("dddd, MMMM Do YYYY, h:mm:ss a z");
  const webhookBody = new WebhookBody();
  const author = commit.data.author;
  const repoUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}`;
  const shortSha = process.env.GITHUB_SHA?.substr(0, 7);
  const section: CardSection = {
    potentialAction: [
      new PotentialAction("View build/deploy status", [
        `${repoUrl}/actions/runs/${process.env.GITHUB_RUN_ID}`,
      ]),
      new PotentialAction("Review commit diffs", [commit.data.html_url]),
    ],
    activityTitle: `**CI #${process.env.GITHUB_RUN_NUMBER} (commit ${shortSha})** on [${process.env.GITHUB_REPOSITORY}](${repoUrl})`,
    activityImage: author.avatar_url || OCTOCAT_LOGO_URL,
    activitySubtitle: `by ${commit.data.commit.author.name} [(@${author.login})](${author.html_url}) on ${nowFmt}`,
  };
  webhookBody.sections?.push(section);
  return webhookBody;
}
