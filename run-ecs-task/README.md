# run-ecs-task

Run a one-off task on Amazon ECS.

```yml
- uses: railsware/github-actions/run-ecs-task@master
  with:
    cluster: mycluster
    service: myapp
    # This command is passed to a shell prompt.
    command: bundle exec rake db:migrate
```

Outputs:

- `url` - the URL of the task in the AWS Console.
