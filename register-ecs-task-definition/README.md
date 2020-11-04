# run-ecs-task

Registers Amazon ECS task definition

```yml
- uses: railsware/github-actions/register-ecs-task-definition@master
  with:
    task_definition_path: path/to/task/definition/file.json
```

Outputs:

- `task_definition_arn` - the ARN of the registered ECS task definition
