# fetch-task-definition

Fetch task definition from ECS (to use with [aws-actions/amazon-ecs-render-task-definition](https://github.com/aws-actions/amazon-ecs-render-task-definition)).

Make sure to provide AWS credentials through the environment: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

```yml
- uses: railsware/github-actions/fetch-task-definition@master
  with:
    name: my_task_definition_name
    # Default filename is task_definition.json
    filename: my_task_definition.json
```


