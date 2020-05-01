import { getInput, setFailed, setOutput, info } from "@actions/core";
import { WebhookBody } from "./models";
import { formatCompactLayout } from "./layouts/compact";
import { formatCozyLayout } from "./layouts/cozy";
import { formatCompleteLayout } from "./layouts/complete";
import { submitNotification, getOctokitCommit } from "./utils";

export const OCTOCAT_LOGO_URL =
  "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png";

async function run() {
  const layout = getInput("layout") || "complete";

  const commit = await getOctokitCommit();

  let webhookBody: WebhookBody;
  if (layout === "compact") {
    webhookBody = formatCompactLayout(commit);
  } else if (layout === "cozy") {
    webhookBody = formatCozyLayout(commit);
  } else {
    // for complete layout
    webhookBody = formatCompleteLayout(commit);
  }

  submitNotification(webhookBody);
}

try {
  run();
} catch (error) {
  setFailed(error.message);
}
