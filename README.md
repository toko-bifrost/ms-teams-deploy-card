# Microsoft Teams Deploy Card

![CI](https://github.com/toko-bifrost/ms-teams-deploy-card/workflows/CI/badge.svg)

A comprehensive notification card in Microsoft Teams for your deployments.

### Usage:

1. Add the following to your repository's configs on Settings > Secrets.

   - `CI_GITHUB_TOKEN` - your [Personal Access Token](https://github.com/settings/tokens) to assume basic authentication on Github APIs. This should at least have full permissions to `repo` and `workflow`.
   - `MS_TEAMS_WEBHOOK_URI` - the [webhook URI](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) of the dedicated Microsoft Teams channel for notification.

2. Add this `step` on your workflow code as one of the earlier `steps`:

```yaml
name: MS Teams Deploy Card

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Notify dedicated teams channel
        uses: toko-bifrost/ms-teams-deploy-card@1.0.0 # or "./" if you need to use this as a local set-up
        with:
          github-token: ${{ secrets.CI_GITHUB_TOKEN }}
          webhook-uri: ${{ secrets.MS_TEAMS_WEBHOOK_URI }}
          deploy-title: Github Actions CI
```

3. Tweak the following configurations
   - `github-token` - (required) the value of `CI_GITHUB_TOKEN`
   - `webhook-uri` - (required) the value of `MS_TEAMS_WEBHOOK_URI`
   - `deploy-title` - (optional, defaults to `Github Actions CI`),
   - `allowed-file-len` - (optional, defaults to `7`),

### Local Set-up

1. Clone this repository.
2. Install JS dependencies via `yarn install` or `npm install`.
3. Before pushing you changes, execute `yarn ncc` to create a build on `dist`.
4. Do not remove the `dist` repository. Ever.
