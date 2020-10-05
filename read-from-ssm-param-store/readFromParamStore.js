const AWS = require("aws-sdk");

const SECURE_MARKER = 'SECURE';

async function readFromParamStore (path, region) {
  const client = new AWS.SSM({
    region: region
  });

  const paramTree = {};

  const data = await readAllParams(client, path)
  data.forEach(function ({Name, Value, Type}) {
    const nameParts = Name.replace(path, '').split('/')
    let keyName = nameParts.pop()
    let value = Value

    if (Type === 'SecureString') {
      keyName = `${keyName}!`
      value = SECURE_MARKER
    }

    const keyContainer = nameParts.reduce(function(acc, partName) {
      if (!acc[partName]) {
        acc[partName] = {};
      }

      return acc[partName]
    }, paramTree)
    keyContainer[keyName] = value
  })

  return paramTree;
}

async function readAllParams(client, path, nextToken) {
  const data = await client.getParametersByPath({
    Path: path,
    Recursive: true,
    WithDecryption: false,
    NextToken: nextToken
  }).promise()

  if (data.NextToken) {
    return data.Parameters.concat(await readAllParams(client, path, data.NextToken));
  }

  return data.Parameters;
}

module.exports = readFromParamStore;

// async function run () {
//   console.log(await readFromParamStore('/sandbox/mailtrap/', 'eu-central-1'))
// }
//
// run()
