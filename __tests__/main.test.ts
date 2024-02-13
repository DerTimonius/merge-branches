import * as core from '@actions/core'
import * as github from '@actions/github'

import * as main from '../src/main'

let getInputMock: jest.SpyInstance
let getBooleanInputMock: jest.SpyInstance

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    getBooleanInputMock = jest
      .spyOn(core, 'getBooleanInput')
      .mockImplementation()
  })

  it('runs the action successfully', async () => {
    getInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'token':
          return 'dummy-token'
        case 'branches':
          return 'develop'
        default:
          return ''
      }
    })

    getBooleanInputMock.mockImplementation((name: string) => {
      switch (name) {
        case 'force':
          return true
        case 'checkTags':
          return true
        default:
          return ''
      }
    })

    const mockGetOctokit = jest.fn().mockReturnValue({
      rest: {
        git: {
          updateRef: jest.fn().mockResolvedValue({ status: 200 })
        }
      }
    })
    jest.spyOn(github, 'getOctokit').mockImplementation(mockGetOctokit)

    await main.run()

    expect(core.getBooleanInput).toHaveBeenCalledTimes(2)
    expect(core.getInput).toHaveBeenCalledTimes(2)
    expect(github.getOctokit).toHaveBeenCalledWith('dummy-token')
  })
})
