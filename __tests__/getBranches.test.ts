/**
 * Unit tests for src/getBranches.ts
 */

import { expect } from '@jest/globals'

import { getBranches } from '../src/getBranches'

describe('getBranches.ts', () => {
  it('correctly creates an array from a string', () => {
    const branchInput = 'develop'
    const branches = getBranches(branchInput)

    expect(branches).toHaveLength(1)
    expect(branches[0]).toEqual('develop')
  })

  it('correctly parsed an array from a string', async () => {
    const branchInput = '[develop, hotfix]'
    const branches = getBranches(branchInput)

    expect(branches).toHaveLength(2)
    expect(branches[0]).toEqual('develop')
    expect(branches[1]).toEqual('hotfix')
  })
})
