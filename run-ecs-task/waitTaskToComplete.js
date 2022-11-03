function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function waitTaskToComplete(ecs, cluster, taskID) {
  let task = null

  do {
    await sleep(1000)
    const {tasks} = await ecs
      .describeTasks({
        cluster: cluster, tasks: [taskID]
      })
      .promise();

    task = tasks[0]
  } while (task.lastStatus !== 'STOPPED')

  return task
}

module.exports = waitTaskToComplete;
