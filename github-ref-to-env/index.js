const core = require("@actions/core");
const parseEnvironmentName = require('./parseEnvironmentName')

async function run() {
  try {
    const githubRef = core.getInput('github-ref', { required: true });
    let map = core.getInput('map')
    if (map) {
      map = JSON.parse(map)
    }

    core.debug(`github-ref: ${githubRef}`)
    core.debug(`github-ref: ${JSON.stringify(map)}`)
    let env = parseEnvironmentName(githubRef, map)

    if (!env) {
      throw new Error('Could not parse environment name')
    }

    core.setOutput('environment', env)
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

if (require.main === module) {
  run();
}
