# run-ecs-task

Parses branch name and optionally maps to environment name

```yml
- uses: railsware/github-actions/branch-to-env@master
  with:
    github-ref: ${{ github.ref }}
    map: ${{ toJSON({ dev: 'staging', production: 'production', '.*': 'sandbox' })  }}
```

Outputs:

- `environment` - environment name


Run locally:
- `yarn run_action --action branch-to-env --github-ref refs/heads/my/branch-name --map '{ "dev": "staging", ".*": "sandbox" }'`
