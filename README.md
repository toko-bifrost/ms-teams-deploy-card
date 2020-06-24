# Microsoft Teams Deploy Card

![MS Teams Deploy Card](https://github.com/toko-bifrost/ms-teams-deploy-card/workflows/MS%20Teams%20Deploy%20Card/badge.svg)

A comprehensive notification card in Microsoft Teams for your deployments.

### Layouts

#### Complete

![](screenshots/layout-complete.png)

#### Cozy

![](screenshots/layout-cozy.png)

#### Compact

![](screenshots/layout-compact.png)

### Usage

1. Add `MS_TEAMS_WEBHOOK_URI` on your repository's configs on Settings > Secrets. It is the [webhook URI](https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook) of the dedicated Microsoft Teams channel for notification.

2) Add a new `step` on your workflow code below `actions/checkout@v2`:

```yaml
name: MS Teams Deploy Card

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - if: always()
      # this is the new step
      - uses: toko-bifrost/ms-teams-deploy-card@master #  or "./" if in a local set-up
        with:
          github-token: ${{ github.token }}
          webhook-uri: ${{ secrets.MS_TEAMS_WEBHOOK_URI }}
```

### Configurations

| Name                | Required | Default    | Description                                                                                                                                                                                                                                                                |
| ------------------- | -------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `github-token`      | `true`   | None       | This can be set to the following:<br/>- `${{ github.token }}`<br/>- `${{ secrets.GITHUB_TOKEN }}`<br/>- `${{ secrets.CUSTOM_TOKEN }}`                                                                                                                                      |
| `webhook-uri`       | `true`   | None       | The value of `MS_TEAMS_WEBHOOK_URI`                                                                                                                                                                                                                                        |
| `environment`       | `false`  | None       | Name of the environment, e.g. `development`, `production` (won't be included in the card if none)                                                                                                                                                                          |
| `timezone`          | `false`  | `UTC`      | A [valid database timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. `Australia/Sydney`                                                                                                                                                    |
| `card-layout-start` | `false`  | `complete` | Card layout on **_start_** (i.e. `complete`, `cozy`, `compact`)                                                                                                                                                                                                            |
| `card-layout-exit`  | `false`  | `compact`  | Card layout on **_exit_** (i.e. `complete`, `cozy`, `compact`)                                                                                                                                                                                                             |
| `show-on-start`     | `false`  | `true`     | Show an MS Teams card upon **_starting_** this Github Actions job                                                                                                                                                                                                          |
| `show-on-exit`      | `false`  | `true`     | Show an MS Teams card upon **_exiting_** this Github Actions job, regardless if it's a successful or a failed exit                                                                                                                                                         |
| `show-on-failure`   | `false`  | `false`    | Show an MS Teams card upon **_exiting_** this Github Actions job and status is `FAILURE`; **This will override any boolean value of `show-on-exit`**, e.g. with `show-on-exit=false` and `show-on-failure=true`, the notification card will still proceed upon job failure |
| `include-files`     | `false`  | `true`     | Include the list of files when `layout` is set to `complete`                                                                                                                                                                                                               |
| `allowed-file-len`  | `false`  | `7`        | Allowed number of changed files to display, when `include-files` is set to `true`                                                                                                                                                                                          |

### Local Set-up

1. Clone this repository.
2. Install JS dependencies via `yarn install` or `npm install`.
3. Before pushing you changes, execute `yarn ncc` (or `npm run ncc`) to create a build on `dist`.
4. Do not remove the `dist` repository. Ever.
5. Check the Actions tab for the errors if there are any.

### Known Issues

- Avoid naming your secrets with the prefix `GITHUB_` as secrets are being used as environment variables, and they are reserved for Github Actions' use only. Better stick with `CI_GITHUB_TOKEN`.
- As this is still in development, always use the working latest version from the `Releases`, as they have more bug fixes and added features.
- Always set this job with `if: always()` when there are steps between `actions/checkout@v2` and this job.
- As much as possible, always set this Github action right after `actions/checkout@v2` and before any job steps. The following diagram shows when this job if going to trigger if done the right way.

```
  job
    |-- actions/checkout@v2
      |-- ms-teams-deploy-card (fires notification of job initiation, if allowed)
        |-- step 1
        |...more steps
        |-- step N
      |-- post ms-teams-deploy-card
          * checks the conclusion based on the previous completed steps
          * fires notification if allowed in the settings
    |-- post actions/checkout@v2
```
