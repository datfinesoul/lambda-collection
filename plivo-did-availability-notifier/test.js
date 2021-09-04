(async () => {
  const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')

  const input = {
    // TODO: Should be lambda/plivo-did-search/environment!
    // TODO: Should be lambda/environment/plivo-did-search?
    SecretId: 'lambda-environment-plivo-did-search'
  }
  const client = new SecretsManagerClient({
    region: 'ap-northeast-1'
  })
  const command = new GetSecretValueCommand(input)
  const result = await client.send(command)
  console.log(result)
})()
