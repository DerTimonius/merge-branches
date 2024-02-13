import * as github from '@actions/github'

import { mergeBranches } from '../src/mergeBranches'

const octokit = github.getOctokit('dummy-token')

const defaultOptions = {
  octokit,
  branch: '',
  checkTags: false,
  force: false,
  ref: '',
  repo: { owner: 'owner', repo: 'repo' },
  sha: 'dummy-sha'
}

describe('mergeBranches.ts', () => {
  it("skips branch if it's the same as the ref", async () => {
    const response = await mergeBranches({
      ...defaultOptions,
      branch: 'main',
      ref: 'refs/head/main'
    })

    expect(response.type).toEqual('info')
    expect(response.message).toEqual(
      "Not updating branch **main** as it's already up to speed."
    )
  })

  it('correctly updates the branch', async () => {
    const updateRef = jest.fn(() => {
      return { status: 200 }
    })
    const response = await mergeBranches({
      ...defaultOptions,
      octokit: { rest: { git: { updateRef } } } as unknown as ReturnType<
        typeof github.getOctokit
      >,
      branch: 'develop',
      ref: 'refs/head/main'
    })

    expect(response.type).toEqual('info')
    expect(response.message).toEqual('Branch **develop** updated successfully')
  })

  it('throws correct error with 404 status', async () => {
    const mockUpdateRef = jest.fn().mockResolvedValueOnce({ status: 404 })
    const octokit = {
      rest: {
        git: {
          updateRef: mockUpdateRef
        }
      }
    } as unknown as ReturnType<typeof github.getOctokit>

    await expect(
      mergeBranches({
        branch: 'main',
        checkTags: true,
        force: false,
        octokit,
        ref: 'refs/heads/develop',
        repo: { owner: 'owner', repo: 'repo' },
        sha: 'dummy-sha'
      })
    ).rejects.toThrow("Branch or reference 'main' not found.")

    expect(mockUpdateRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      force: false,
      sha: 'dummy-sha',
      ref: 'heads/main'
    })
  })

  it('throws correct error with 403 status', async () => {
    const mockUpdateRef = jest.fn().mockResolvedValueOnce({ status: 403 })
    const octokit = {
      rest: {
        git: {
          updateRef: mockUpdateRef
        }
      }
    } as unknown as ReturnType<typeof github.getOctokit>

    await expect(
      mergeBranches({
        branch: 'main',
        checkTags: true,
        force: false,
        octokit,
        ref: 'refs/heads/develop',
        repo: { owner: 'owner', repo: 'repo' },
        sha: 'dummy-sha'
      })
    ).rejects.toThrow(
      'Forbidden: Insufficient permissions to perform the operation.'
    )

    expect(mockUpdateRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      force: false,
      sha: 'dummy-sha',
      ref: 'heads/main'
    })
  })

  it('throws correct error with unknown status', async () => {
    const mockUpdateRef = jest.fn().mockResolvedValueOnce({ status: 500 })
    const octokit = {
      rest: {
        git: {
          updateRef: mockUpdateRef
        }
      }
    } as unknown as ReturnType<typeof github.getOctokit>

    await expect(
      mergeBranches({
        branch: 'main',
        checkTags: true,
        force: false,
        octokit,
        ref: 'refs/heads/develop',
        repo: { owner: 'owner', repo: 'repo' },
        sha: 'dummy-sha'
      })
    ).rejects.toThrow(
      'An error occurred while updating branch **main**. Status: 500'
    )

    expect(mockUpdateRef).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      force: false,
      sha: 'dummy-sha',
      ref: 'heads/main'
    })
  })

  it('should return warning message when tag is not head of any branches', async () => {
    // Mock GitHub API calls
    octokit.rest.repos.listBranchesForHeadCommit = jest
      .fn()
      .mockResolvedValueOnce({ data: [] }) as any

    const result = await mergeBranches({
      ...defaultOptions,
      octokit,
      branch: 'main',
      ref: 'refs/tags/v1.0.0',
      checkTags: true
    })

    expect(result.type).toEqual('warning')
    expect(result.message).toEqual(
      "The given tag isn't the head of any branches"
    )
  })

  it('should return warning message when tag is not head of a protected branch', async () => {
    // Mock GitHub API calls
    octokit.rest.repos.listBranchesForHeadCommit = jest
      .fn()
      .mockResolvedValueOnce({ data: [{ protected: false }] }) as any

    const result = await mergeBranches({
      ...defaultOptions,
      octokit,
      branch: 'main',
      ref: 'refs/tags/v1.0.0',
      checkTags: true
    })

    expect(result.type).toEqual('warning')
    expect(result.message).toEqual(
      "A tag was pushed but isn't head of a protected branch, skipping"
    )
  })
})
