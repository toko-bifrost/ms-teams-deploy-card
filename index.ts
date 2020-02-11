import { getInput, setOutput, setFailed } from "@actions/core";
import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";

const run = async () => {
  const webhookUri = getInput("webhook-uri");
  const githubToken = getInput("github-token");
  const summary = getInput("deploy-title");
  const allowedFileLen = parseInt(getInput("allowed-file-len"));

  const octokit = new Octokit({ auth: `token ${githubToken}` });
  if (
    process.env.GITHUB_ACTOR &&
    process.env.GITHUB_REPOSITORY &&
    process.env.GITHUB_SHA &&
    process.env.GITHUB_REF
  ) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const sha = process.env.GITHUB_SHA;
    const ref = process.env.GITHUB_REF;
    const params = { owner, repo, ref: sha };
    const commit = await octokit.repos.getCommit(params);

    const filesChanged = commit.data.files
      .slice(0, allowedFileLen)
      .map(
        (file: any) =>
          `[${file.filename}](${file.blob_url}) (${file.changes} changes)`
      );

    let filesToDisplay = "*" + filesChanged.join("\n\n* ");
    if (commit.data.files.length > 7) {
      const moreLen = commit.data.files.length - 7;
      filesToDisplay += `\n\n* and [${commit.data.html_url} more files](${moreLen}) changed`;
    }

    const branchUrl = `https://github.com/${params.repo}/tree/${ref}`;
    const author = commit.data.author;
    const time = new Date().toTimeString();
    const sections = [
      {
        facts: [
          {
            name: "Commit message:",
            value: `<notextile>${commit.data.commit.message}</notextile>`
          },
          {
            name: "Repository & branch:",
            value: `[${branchUrl}](${branchUrl})`
          },
          {
            name: "Files changed:",
            value: filesToDisplay
          }
        ],
        potentialAction: [
          {
            "@context": "http://schema.org",
            target: [process.env.GITHUB_RUN_NUMBER],
            "@type": "ViewAction",
            name: "View deploy status"
          },
          {
            "@context": "http://schema.org",
            target: [commit.data.html_url],
            "@type": "ViewAction",
            name: "Review commit diffs"
          }
        ],
        activityTitle: `**Deployment CI ${process.env.GITHUB_RUN_NUMBER} (commit ${params.ref})**`,
        activityImage: author.avatar_url,
        activitySubtitle: `by [@${author.gravatar_id}](${author.html_url}) on ${time}`
      }
    ];
    setOutput("time", time);
    const response = await fetch(webhookUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ summary, sections })
    });
    console.log(`The event payload: ${response.json()}`);
  } else {
    setFailed(
      "Cannot process without variables GITHUB_ACTOR, GITHUB_REPOSITORY, GITHUB_SHA, and GITHUB_REF."
    );
  }
};

try {
  run();
} catch (error) {
  setFailed(error.message);
}
