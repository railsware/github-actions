const fs = require('fs')
const YAML = require('yaml')
const commander = require('commander');
const {spawn} = require('child_process');

function runAction(cmd, args, opts ) {
  const child = spawn(cmd, args, {
    env: {
      ...process.env,
      ...opts.env
    },
    stdio: 'inherit',
  });

  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command ${cmd} ${args.join(' ')} exited with status code ${code}`));
      }
    });
  })
}

function toInputName(str) {
  return 'INPUT_' +
    str
    .replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
    .toUpperCase()
}

function toParamName(str) {
  return str.replace(/-\w/g, match => match[1].toUpperCase())
}

async function run() {
  commander
    .storeOptionsAsProperties(false)
    .passCommandToAction(false)
    .allowUnknownOption()
    .requiredOption(`--action <type>`, "Action to run")
  commander.parse(process.argv)

  const {action} = commander.opts()

  const file = fs.readFileSync(`./${action}/action.yml`)
  const config = YAML.parse(file.toString())

  Object.keys(config.inputs).forEach(function (name) {
    const input = config.inputs[name]

    if (input.required) {
      commander.requiredOption(`--${name} <type>`, input.description)
    } else {
      commander.option(`--${name} <type>`, input.description)
    }
  })

  commander.parse(process.argv)
  const options = commander.opts();
  const inputs = Object.keys(config.inputs).reduce(function (acc, name) {
    return {
      ...acc,
      [toInputName(name)]: options[toParamName(name)]
    }
  }, {})

  try {
    await runAction('node', [`./${action}/index.js`], {env: inputs});
  } catch (error) {
    console.error(error)
  }
}

run()
