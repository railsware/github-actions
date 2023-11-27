const { CloudWatchLogs } = require('@aws-sdk/client-cloudwatch-logs');

async function readTaskLogs(logConfig, containerName, taskId) {
  let nextToken = null
  if (logConfig.logDriver !== 'awslogs') {
    throw new Error(`Unsupported log driver ${logConfig.logDriver}. Only 'awslogs' is supported`)
  }

  const cloudWatchLogs = new CloudWatchLogs()

  const params = {
    logGroupName: logConfig.options['awslogs-group'],
    logStreamName: `${logConfig.options['awslogs-stream-prefix']}/${containerName}/${taskId}`,
    startFromHead: true
  }

  const logs = []

  do {
    const {events, nextForwardToken} = await cloudWatchLogs.getLogEvents({
      ...params,
      nextToken: nextToken
    });
    if (events.length === 0) {
      break;
    }

    nextToken = nextForwardToken
    events.forEach(({message}) => logs.push(message))
  } while (nextToken)

  return logs
}

module.exports = readTaskLogs;

