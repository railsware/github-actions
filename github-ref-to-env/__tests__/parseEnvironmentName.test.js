const parseEnvironmentName = require('../parseEnvironmentName')

describe('parseEnvironmentName', () => {
  it('parses branch name', () => {
    expect(parseEnvironmentName('refs/heads/my/branch-name')).toEqual('my/branch-name')
    expect(parseEnvironmentName('refs/tags/v-1.12.33')).toEqual('v-1.12.33')
    expect(parseEnvironmentName('refs/heads/production')).toEqual('production')
  })

  describe('when branch to env mapping is given', () => {
    it('maps github ref to env using the map', () => {
      expect(parseEnvironmentName('id/MT-877-test-workflow-run', {
        "master": "production",
        "id/MT-877-test-workflow-run": "staging"
      })).toEqual('staging')

      expect(parseEnvironmentName('refs/heads/my/branch-name', {
        "my/branch-name": "sandbox"
      })).toEqual('sandbox')

      expect(parseEnvironmentName('refs/heads/my/branch-name', {
        ".*": "sandbox"
      })).toEqual('sandbox')

      expect(parseEnvironmentName('refs/heads/my/branch-name', {
        ".*": "sandbox",
        "my/branch-name": "staging"
      })).toEqual('staging')

      expect(parseEnvironmentName('refs/heads/no-map-match', {
        "my/branch-name": "sandbox"
      })).toBeUndefined()
    })
  })
})
