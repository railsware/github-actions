const core = require("@actions/core");
const AWS = require("aws-sdk");
const readTaskLogs = require("./readTaskLogs")
const waitTaskToComplete = require("./waitTaskToComplete")

async function run() {
  try {
    const cluster = core.getInput("cluster", { required: true });
    const serviceName = core.getInput("service", { required: true });
    const command = core.getInput("command", { required: true });
    const givenTaskDefinition = core.getInput("task_definition", { required: false });
    const showRawOutput = core.getInput("show_raw_output", { required: false });

    const ecs = new AWS.ECS();

    const servicesResponse = await ecs
      .describeServices({ cluster, services: [serviceName] })
      .promise();

    if (!servicesResponse.services || servicesResponse.services.length === 0) {
      throw new Error("no such service");
    }

    const service = servicesResponse.services[0];

    const taskDefinitionResponse = await ecs
      .describeTaskDefinition({
        taskDefinition: givenTaskDefinition || service.taskDefinition,
      })
      .promise();

    const taskDefinition = taskDefinitionResponse.taskDefinition;

    if (taskDefinition.containerDefinitions.length != 1) {
      throw new Error(
        "Running in tasks with more than one container is not yet supported"
      );
    }

    const containerName = taskDefinition.containerDefinitions[0].name;

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
        networkConfiguration: service.deployments[0].networkConfiguration,
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
    if (showRawOutput) {

      await waitTaskToComplete(ecs, cluster, taskID)
      console.log(`Task completed`);

      const logConfig = taskDefinition.containerDefinitions[0].logConfiguration
      const logs = await readTaskLogs(logConfig, containerName, taskID)

      const prettyOutput = JSON.stringify(logs, null, 2)
      console.log(`Task output %o`, prettyOutput);
      core.setOutput("raw_output", logs);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

if (require.main === module) {
  run();
}

// exit unless config[:watch]

// puts 'Watching task. Note - Ctrl+C will stop watching, but will NOT stop the task!'
// last_notified_status = ''

// log_configuration = task_definition.container_definitions.first.log_configuration
// log_client = nil
// log_stream_name = nil
// log_token = nil
// if log_configuration.log_driver == 'awslogs'
//   log_client = Aws::CloudWatchLogs::Client.new
//   log_stream_name = "#{log_configuration.options['awslogs-stream-prefix']}/#{container_name}/#{task_id}"
//   log_token = nil
// else
//   puts 'Use `awslogs` log adapter to see the task output.'
// end

// loop do
//   task_status = client.describe_tasks(cluster: config[:cluster], tasks: [task_id]).tasks[0].last_status
//   if task_status != last_notified_status
//     puts "[#{Time.now}] Task status changed to #{task_status}"
//     last_notified_status = task_status
//     break if task_status == 'STOPPED'
//   end

//   if log_client && %w[RUNNING DEPROVISIONING].include?(task_status)
//     events_resp = log_client.get_log_events(
//       log_group_name: log_configuration.options['awslogs-group'],
//       log_stream_name: log_stream_name,
//       start_from_head: true,
//       next_token: log_token
//     )
//     events_resp.events.each do |event|
//       puts "[#{Time.at(event.timestamp / 1000)}] #{event.message}"
//     end
//     log_token = events_resp.next_forward_token
//   end
//   sleep 1
// end
