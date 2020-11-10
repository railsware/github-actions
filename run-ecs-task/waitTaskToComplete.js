function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function waitTaskToComplete(ecs, cluster, taskID) {
  let lastStatus = null

  do {
    await sleep(1000)
    const {tasks} = await ecs
      .describeTasks({
        cluster: cluster, tasks: [taskID]
      })
      .promise();

    lastStatus = tasks[0].lastStatus
  } while (lastStatus !== 'STOPPED')
}

module.exports = waitTaskToComplete;
