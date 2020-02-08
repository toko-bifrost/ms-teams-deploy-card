import { getInput, setOutput, setFailed } from "@actions/core";
import { GitHub, context } from "@actions/github";

const run = async () => {
  const { repo, ref, payload, sha } = context;
  const webhookUri = getInput("webhook-uri");
  const githubToken = getInput("github-token");
  const summary = getInput("deploy-title");
  const allowedFileLen = parseInt(getInput("allowed-file-len"));

  const octokit = new GitHub(githubToken);
  const commit = await (octokit as any).repos.getCommit({
    owner: process.env.GITHUB_ACTOR,
    repo: repo.repo,
    ref: sha
  });

  const branchUrl = `${payload.repository?.full_name}/tree/${ref}`;
  const filesChanged = commit.files
    .slice(0, allowedFileLen)
    .map(
      (file: any) =>
        `[${file.filename}](${file.blob_url}) (${file.changes} changes)`
    );
  let filesToDisplay = "*" + filesChanged.join("\n\n* ");
  if (commit.files.length > 7) {
    const moreLen = commit.files.length - 7;
    filesToDisplay += `\n\n* and [${commit.html_url} more files](${moreLen}) changed`;
  }
  const sections = [
    {
      facts: [
        {
          name: "Commit message:",
          value: `<notextile>${commit.commit.message}</notextile>`
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
          target: [commit.html_url],
          "@type": "ViewAction",
          name: "Review commit diffs"
        }
      ],
      activityTitle: `**Deployment CI ${process.env.GITHUB_RUN_NUMBER} (commit ${sha})**`,
      activityImage: commit.author.avatar_url,
      activitySubtitle: `by [${commit.commit.author.name} (@${commit.author.html_url})](${commit.author.login}) on ${commit.last_modified}`
    }
  ];
  const time = new Date().toTimeString();
  setOutput("time", time);
  const response = await fetch(webhookUri, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ summary, sections })
  });
  console.log(`The event payload: ${response.json()}`);
};

try {
  run();
} catch (error) {
  setFailed(error.message);
}
