const core = require("@actions/core");
const parseEnvironmentName = require('./parseEnvironmentName')

async function run() {
  try {
    const githubRef = core.getInput('github-ref', { required: true });
    let map = core.getInput('map')
    if (map) {
      map = JSON.parse(map)
    }

    let env = parseEnvironmentName(githubRef, map)

    core.setOutput('environment', env)
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

if (require.main === module) {
  run();
}
