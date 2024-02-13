import * as github from '@actions/github'

export async function mergeBranches({
  branch,
  checkTags,
  force,
  octokit,
  ref,
  repo,
  sha
}: {
  branch: string
  checkTags: boolean
  force: boolean
  octokit: ReturnType<typeof github.getOctokit>
  ref: string
  repo: {
    owner: string
    repo: string
  }
  sha: string
}): Promise<{ type: 'info' | 'warning' | 'error'; message: string }> {
  if (ref === `refs/head/${branch}`) {
    return {
      type: 'info',
      message: `Not updating branch **${branch}** as it's already up to speed.`
    }
  }
  if (checkTags && ref.startsWith('refs/tags/')) {
    const { data: heads } = await octokit.rest.repos.listBranchesForHeadCommit({
      ...repo,
      commit_sha: sha
    })

    if (!heads.length) {
      return {
        type: 'warning',
        message: "The given tag isn't the head of any branches"
      }
    }

    if (!heads.find(value => value.protected)) {
      return {
        type: 'warning',
        message:
          "A tag was pushed but isn't head of a protected branch, skipping"
      }
    }
  }

  const response = await octokit.rest.git.updateRef({
    ...repo,
    force,
    sha,
    ref: `heads/${branch}`
  })

  if (response.status === 200) {
    return {
      type: 'info',
      message: `Branch **${branch}** updated successfully`
    }
  }

  if (response.status === 404) {
    throw new Error(`Branch or reference '${branch}' not found.`)
  }

  if (response.status === 403) {
    throw new Error(
      'Forbidden: Insufficient permissions to perform the operation.'
    )
  }

  throw new Error(
    `An error occurred while updating branch **${branch}**. Status: ${response.status}`
  )
}
