# Microsoft Teams Deploy Card

![MS Teams Deploy Card](https://github.com/toko-bifrost/ms-teams-deploy-card/workflows/MS%20Teams%20Deploy%20Card/badge.svg)

A comprehensive notification card in Microsoft Teams for your deployments.

### Usage:

1. Add the following to your repository's configs on Settings > Secrets.

   - `CI_GITHUB_TOKEN` - your [Personal Access Token](https://github.com/settings/tokens) to assume the basic authentication and other authorizations in Github API. This should at least have full permissions to `repo` and `workflow`.
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
        uses: toko-bifrost/ms-teams-deploy-card@1.0.0 #  or "./" if in a local set-up
        with:
          github-token: ${{ secrets.CI_GITHUB_TOKEN }}
          webhook-uri: ${{ secrets.MS_TEAMS_WEBHOOK_URI }}
          deploy-title: Github Actions CI
```

3. Tweak the following configurations
   - `github-token` - (required) the value of `CI_GITHUB_TOKEN`
   - `webhook-uri` - (required) the value of `MS_TEAMS_WEBHOOK_URI`
   - `deploy-title` - (optional, defaults to `Github Actions CI`),
   - `allowed-file-len` - (optional, defaults to `7`), allowed number of changed files to display
   - `timezone` - (optional, defaults to `UTC`), a [valid database timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. "Australia/Sydney"

### Local Set-up

1. Clone this repository.
2. Install JS dependencies via `yarn install` or `npm install`.
3. Before pushing you changes, execute `yarn ncc` to create a build on `dist`.
4. Do not remove the `dist` repository. Ever.
5. Check the Actions tab for the errors if there are any.
