const core = require("@actions/core");

function parseBranch (ref) {
  const regex = /refs\/(heads|tags)\/(\S*)/
  const match = ref.match(regex)

  if (match) {
    return match[2]
  }

  return ref
}

function parseEnvironmentName(githubRef, map) {
  let env = parseBranch(githubRef)

  core.debug(`parsed env is ${env}`)

  if (map) {
    // we intentionally do sort reverse to push capture everything key `.*` to end
    const keys = Object.keys(map).sort().reverse();
    const mappedName = keys.find((name) => {
      const regex = new RegExp(name)

      return regex.test(env)
    })

    env = map[mappedName]
    core.debug(`mapped env is ${env}`)
  }

  return env;
}

module.exports = parseEnvironmentName
