const core = require('@actions/core')
const childProcess = require('child_process')

async function run() {
  try {
    const taskDefinitionName = core.getInput('name', {required: true})
    const filename = core.getInput('filename')

    childProcess.execSync(
      `aws ecs describe-task-definition --task-definition ${taskDefinitionName} | \\
        jq '.taskDefinition|del(.compatibilities,.taskDefinitionArn,.requiresAttributes,.revision,.status)' \\
        > ${filename}`
    )

    core.setOutput('filename', filename)
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = run

if (require.main === module) {
  run()
}
