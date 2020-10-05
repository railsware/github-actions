const core = require('@actions/core');
const readFromParamStore = require('./readFromParamStore')

async function run() {
  try {
    const region = core.getInput("region", { required: true });
    const path = core.getInput("path", { required: true });
    const result = await readFromParamStore(path, region);

    core.setOutput('result', result);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

if (require.main === module) {
  run();
}
