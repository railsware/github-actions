const core = require("@actions/core");
const AWS = require("aws-sdk");

async function run() {
  const ecs = new AWS.ECS();
  const taskDefinitionPath = core.getInput('task_definition_path', { required: true });

  const taskDefinition = require(taskDefinitionPath);

  let response;
  try {
    response = await ecs.registerTaskDefinition(taskDefinition).promise();
    core.setOutput('task_definition_arn', response.taskDefinition.taskDefinitionArn);
  } catch (error) {
    core.setFailed("Failed to register task definition in ECS: " + error.message);
    core.debug("Task definition contents:");
    core.debug(JSON.stringify(taskDefinition, undefined, 2));
  }
}

module.exports = run;

if (require.main === module) {
  run();
}
