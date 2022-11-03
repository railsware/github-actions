const runEcsTask = require('../runEcsTask')

describe('runEcsTask', () => {
  const buildMock = (data) => (
    jest.fn().mockReturnValue({
      promise: () => Promise.resolve(data)
    })
  )
  const buildEcsMock = ({
                          describeServices = buildMock({
                            services: [{
                              taskDefinition: 'ServiceTaskDefinition',
                              deployments: [{
                                networkConfiguration: 'deployentNetworkConfiguration'
                              }],
                              taskSets: [{
                                networkConfiguration: 'taskSetsNetworkConfiguration'
                              }]
                            }]
                          }),
                          describeTaskDefinition = buildMock({
                            taskDefinition: {
                              containerDefinitions: [{
                                name: 'EcsContainerDefinition',
                                logConfiguration: {
                                  logDriver: 'awslogs',
                                  options: {
                                    'awslogs-group': 'MyLogGroup',
                                    'awslogs-stream-prefix': 'MyPrefix'
                                  }
                                }
                              }]
                            }
                          }),
                          runTask = buildMock({
                            tasks: [{
                              taskArn: 'arn:aws:ecs:us-east-1:12345:task/qa-mailtrap/some-hash'
                            }]
                          }),
                          describeTasks = buildMock({
                            tasks: [{
                              lastStatus: 'STOPPED',
                              containers: [{
                                name: 'EcsContainerDefinition',
                                exitCode: 0
                              }]
                            }]
                          })

                        }) => ({
    describeServices,
    describeTaskDefinition,
    runTask,
    describeTasks
  })

  it('exits normally if task exits with 0 code', async () => {
    const ecs = buildEcsMock({})

    await runEcsTask({
      ecs,
      cluster: 'MyCluster',
      serviceName: 'MyService',
      definedContainerName: null,
      command: 'echo "whatever"',
      givenTaskDefinition: null,
      waitForCompletion: 'true'
    })

    expect(ecs.describeServices.mock.calls.length).toEqual(1)
    expect(ecs.describeServices.mock.calls[0]).toEqual([{
      "cluster": "MyCluster",
      "services": ["MyService"]
    }])

    expect(ecs.describeTaskDefinition.mock.calls.length).toEqual(1)
    expect(ecs.describeTaskDefinition.mock.calls[0]).toEqual([{"taskDefinition": "ServiceTaskDefinition"}])

    expect(ecs.runTask.mock.calls.length).toEqual(1)
    expect(ecs.runTask.mock.calls[0]).toEqual([{
      "cluster": "MyCluster",
      "launchType": "FARGATE",
      "networkConfiguration": "deployentNetworkConfiguration",
      "overrides": {
        "containerOverrides": [{
          "command": ["sh", "-c", "echo \"whatever\""],
          "name": "EcsContainerDefinition"
        }]
      },
      "taskDefinition": undefined
    }])

    expect(ecs.describeTasks.mock.calls.length).toEqual(1)
    expect(ecs.describeTasks.mock.calls[0]).toEqual([{"cluster": "MyCluster", "tasks": ["some-hash"]}])
  })

  it('throws if task exits with 0 code', async () => {
    const ecs = buildEcsMock({
        describeTasks: buildMock({
          tasks: [{
            lastStatus: 'STOPPED',
            containers: [{
              name: 'EcsContainerDefinition',
              exitCode: 123
            }]
          }]
        })
      }
    )

    await expect(runEcsTask({
      ecs,
      cluster: 'MyCluster',
      serviceName: 'MyService',
      definedContainerName: null,
      command: 'echo "whatever"',
      givenTaskDefinition: null,
      waitForCompletion: 'true'
    })).rejects.toThrow('Task exited abnormally. Exit code: 123')
  })

  it('calls given task definition', async () => {
    const ecs = buildEcsMock({})

    await runEcsTask({
      ecs,
      cluster: 'MyCluster',
      serviceName: 'MyService',
      definedContainerName: null,
      command: 'echo "whatever"',
      givenTaskDefinition: 'GivenTaskDefinition',
      waitForCompletion: 'true'
    })

    expect(ecs.describeTaskDefinition.mock.calls.length).toEqual(1)
    expect(ecs.describeTaskDefinition.mock.calls[0]).toEqual([{"taskDefinition": "GivenTaskDefinition"}])
  })

  it('calls given container', async () => {
    const ecs = buildEcsMock({
      describeTaskDefinition: buildMock({
        taskDefinition: {
          containerDefinitions: [{
            name: 'EcsContainerDefinition',
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-group': 'MyLogGroup',
                'awslogs-stream-prefix': 'MyPrefix'
              }
            }
          }, {
            name: 'definedContainerName',
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-group': 'DefinedLogGroup',
                'awslogs-stream-prefix': 'DefinedPrefix'
              }
            }
          }]
        }
      }),
      describeTasks: buildMock({
        tasks: [{
          lastStatus: 'STOPPED',
          containers: [{
            name: 'EcsContainerDefinition',
            exitCode: 0
          }, {
            name: 'definedContainerName',
            exitCode: 0
          }]
        }]
      })

    })

    await runEcsTask({
      ecs,
      cluster: 'MyCluster',
      serviceName: 'MyService',
      definedContainerName: 'definedContainerName',
      command: 'echo "whatever"',
      givenTaskDefinition: null,
      waitForCompletion: 'true'
    })

    expect(ecs.runTask.mock.calls.length).toEqual(1)
    expect(ecs.runTask.mock.calls[0]).toEqual([{
      "cluster": "MyCluster",
      "launchType": "FARGATE",
      "networkConfiguration": "deployentNetworkConfiguration",
      "overrides": {
        "containerOverrides": [{
          "command": ["sh", "-c", "echo \"whatever\""],
          "name": "definedContainerName"
        }]
      },
      "taskDefinition": undefined
    }])
  })

  it('raises if there are multiple containers defined', async () => {
    const ecs = buildEcsMock({
      describeTaskDefinition: buildMock({
        taskDefinition: {
          containerDefinitions: [{
            name: 'EcsContainerDefinition',
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-group': 'MyLogGroup',
                'awslogs-stream-prefix': 'MyPrefix'
              }
            }
          }, {
            name: 'definedContainerName',
            logConfiguration: {
              logDriver: 'awslogs',
              options: {
                'awslogs-group': 'DefinedLogGroup',
                'awslogs-stream-prefix': 'DefinedPrefix'
              }
            }
          }]
        }
      }),
      describeTasks: buildMock({
        tasks: [{
          lastStatus: 'STOPPED',
          containers: [{
            name: 'EcsContainerDefinition',
            exitCode: 0
          }, {
            name: 'definedContainerName',
            exitCode: 0
          }]
        }]
      })
    })

    await expect(runEcsTask({
      ecs,
      cluster: 'MyCluster',
      serviceName: 'MyService',
      definedContainerName: null,
      command: 'echo "whatever"',
      givenTaskDefinition: null,
      waitForCompletion: 'true'
    })).rejects.toThrow('Running in tasks with more than one container is not yet supported')
  })
})
