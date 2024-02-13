# Merge Branches with GitHub Actions

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

A GitHub Action to keep important branches up to date! It's especially useful if
you have a `staging` and a `hotfix` branch that both push to `main` and need to
be up to date with the latest changes to main at all times.

## Usage

Here's a quick example workflow that triggers on every push on `main` that
updates a single branch called `develop`:

```yaml
name: Merge branches

on:
  push:
    branches:
      - main

jobs:
  merge-branches:
    name: Merge main into develop
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Test Local Action
        if: github.ref == "refs/head/main"
        uses: DerTimonius/merge-branches@v1
        with:
          token: ${{ secrets.GITHUB_ACCESS_TOKEN }}
          branches: develop
          force: true
```

You can also pass in multiple branches in an array (you have to use brackets for
this work properly):

```yaml
name: Merge branches

on:
  push:
    branches:
      - main

jobs:
  merge-branches:
    name: Merge main into develop
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Test Local Action
        if: github.ref == "refs/head/main"
        uses: DerTimonius/merge-branches@v1
        with:
          token: ${{ secrets.GITHUB_ACCESS_TOKEN }}
          branches: [develop, hotfix]
          force: true
```

## GitHub Personal Access Token

A Personal Access Token (PAT) is necessary for this action to run. You can learn
about PATs
[here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

## Tag check

When the option `checkTags` is set to `true`, this aciton will check if the tag
is the `HEAD` of a protected branch. If it's not the head or if it's not the
head of the protected branch, the action fails.

## Options

<!-- markdownlint-disable MD013-->

| Name                                      | Type             | Description                                                                       |
| ----------------------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| `token`                                   | required         | GitHub Personal Access Token needed for the commit.                               |
| `branches`                                | required         | The branches that should be updated. For example `develop` or `[develop, hotfix]` |
| `force`                                   | default: `false` | Defines if the commit should be force-pushed or not.                              |
| `checkTags`                               | default: `false` | Enable tag checks by setting checkTags to true if you want to include tag         |
| validation in the GitHub Action workflow. |

<!-- markdownlint-enable MD013-->
