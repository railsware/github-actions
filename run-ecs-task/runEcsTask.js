const core = require("@actions/core");
const readTaskLogs = require("./readTaskLogs")
const waitTaskToComplete = require("./waitTaskToComplete")

async function runEcsTask({ ecs, cluster, serviceName, definedContainerName, command, givenTaskDefinition, waitForCompletion, showRawOutput }) {
  const servicesResponse = await ecs
    .describeServices({ cluster, services: [serviceName] })
    .promise();

  if (!servicesResponse.services || servicesResponse.services.length === 0) {
    throw new Error("no such service");
  }

  const service = servicesResponse.services[0];

  const {taskDefinition} = await ecs
    .describeTaskDefinition({
      taskDefinition: givenTaskDefinition || service.taskDefinition,
    })
    .promise();

  const containerName = (() => {
    if (definedContainerName) {
      return definedContainerName;
    } else {
      if (taskDefinition.containerDefinitions.length != 1) {
        throw new Error(
          "Running in tasks with more than one container is not yet supported"
        );
      }

      return taskDefinition.containerDefinitions[0].name;
    }
  })()

  const networkConfiguration = service.deployments[0] ?
    service.deployments[0].networkConfiguration :
    service.taskSets[0].networkConfiguration

  const taskResponse = await ecs
    .runTask({
      cluster,
      taskDefinition: taskDefinition.taskDefinitionArn,
      launchType: "FARGATE",
      overrides: {
        containerOverrides: [
          {
            name: containerName,
            command: ["sh", "-c", command],
          },
        ],
      },
      networkConfiguration
    })
    .promise();

  const taskArn = taskResponse.tasks[0].taskArn;
  const taskArnParts = taskArn.split(":");
  const taskRegion = taskArnParts[3];
  const idParts = taskArnParts[5].split("/");
  const taskID = idParts[idParts.length - 1];

  const outputURL = `https://${taskRegion}.console.aws.amazon.com/ecs/home?region=${taskRegion}#/clusters/${cluster}/tasks/${taskID}/details`;

  console.log(`Task started. Track it online at ${outputURL}`);

  core.setOutput("url", outputURL);

  if (waitForCompletion === "true") {
    const task = await waitTaskToComplete(ecs, cluster, taskID)
    console.log("Task completed")

    if (showRawOutput === "true") {
      const logConfig = taskDefinition.containerDefinitions[0].logConfiguration
      const logs = await readTaskLogs(logConfig, containerName, taskID)

      const prettyOutput = JSON.stringify(logs, null, 2)
      console.log(`Task output %o`, prettyOutput);
      core.setOutput("raw_output", logs);
    }

    const container = task.containers.find(({name}) => name === containerName);
    if (container && container.exitCode !== 0) {
      throw new Error(`Task exited abnormally. Exit code: ${container.exitCode}`)
    }
  } else {
    console.log("The task is up and running but the action isn't going to wait for execution to complete");
  }
}

module.exports = runEcsTask;
