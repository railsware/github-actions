# read-from-ssm-param-store

Retrieve information about parameters in a specific hierarchy

```yml
- uses: railsware/github-actions/read-from-ssm-param-store@master
  with:
    path: /sandbox/
    region: ew-west-1
```

Outputs:

- `result` - JSON read from param store.
