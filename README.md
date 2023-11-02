# Railsware Github Actions

A collection of GitHub actions used at Railsware

- [fetch-task-defintion](/fetch-task-definition/README.md) - fetch a task definition from AWS Elastic Container Service
- [read-from-ssm-param-store](/read-from-ssm-param-store/README.md) - retrieve information about parameters in a specific hierarchy
- [run-ecs-task](/run-ecs-task/README.md) - run a one-off task on AWS Elastic Container Service

---

## running action on local machine
- `yarn run_action --action name --param-1 value1 --param-2 value2 --param-3 value`
  - `name` action name to run
  - `param-x` - param like they specified in action.yml
- i.e when using credential profiles it could be like following:
```bash
  ACTIONS_RUNNER_DEBUG=true AWS_SDK_LOAD_CONFIG=1 AWS_PROFILE=my-work-profile AWS_REGION=us-east-1 yarn run_action \
    --action run-ecs-task \
    --cluster my-cluster \
    --service my-service \
    --container my-container \
    --command 'echo "Hello World"' \
    --task-definition 'my_task_definition_arn' \
    --wait-for-completion true \
    --show-raw-output false
```
[Railsware](https://railsware.com)
