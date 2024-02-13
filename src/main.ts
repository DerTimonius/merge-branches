import * as core from '@actions/core'
import * as github from '@actions/github'

import { getBranches } from './getBranches'
import { mergeBranches } from './mergeBranches'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const force = core.getBooleanInput('force')
    const checkTags = core.getBooleanInput('checkTags')

    const branchesInput = core.getInput('branches')
    const branches = getBranches(branchesInput)

    const githubToken = core.getInput('token')
    const octokit = github.getOctokit(githubToken)
    const { ref, repo, sha } = github.context

    await Promise.all(
      branches.map(async branch => {
        const response = await mergeBranches({
          branch,
          checkTags,
          force,
          ref,
          repo,
          sha,
          octokit
        })

        core[response.type](response.message)
      })
    )
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
