'use strict'
const { metricScope, Unit } = require("aws-embedded-metrics");

async function sendSms (phoneNumber, message) {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-sns/index.html
  if (!message) {
    throw new RangeError('missing message')
  }
  if (!phoneNumber) {
    throw new RangeError('missing phoneNumber')
  }

  const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
  const input = {
    Message: message,
    PhoneNumber: phoneNumber
  }
  const client = new SNSClient({
    region: 'ap-northeast-1'
  })
  const command = new PublishCommand(input)
  return await client.send(command)
}

async function getSecret (secretId) {
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-secrets-manager/index.html
  if (!secretId) {
    throw new RangeError('missing secretId')
  }

  const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager')
  const input = {
    SecretId: secretId,
    VersionState: 'AWSCURRENT'
  }
  const client = new SecretsManagerClient({
    region: 'ap-northeast-1'
  })
  const command = new GetSecretValueCommand(input)
  const result = await client.send(command)
  return JSON.parse(result.SecretString)
}

async function searchNumbers ({ plivoId, plivoToken, countryCode }) {
  // https://www.plivo.com/docs/numbers/api/phone-number#search-phone-numbers
  const plivo = require('plivo')
  const client = new plivo.Client(plivoId, plivoToken)
  // https://www.plivo.com/docs/numbers/api/phone-number#search-phone-numbers
  const res = await client.numbers.search(countryCode)

  if (res?.meta?.totalCount === undefined) {
    throw new Error("'meta.totalCount' is missing in response")
  }

  return {
    count: res.meta.totalCount,
    numbers: res.meta.objects ?? []
  }
}

async function hydrateConfig (config, event, context) {
  const { countryCode } = event
  if (!countryCode) {
    throw new RangeError('missing countryCode')
  }
  const secretsEnv = await getSecret(`lambda/${context.functionName}/env`)
    .catch(err => {
      console.error(JSON.stringify({ error: err.toString() }))
      return {}
    })
  const {
    PLIVO_AUTH_ID: plivoId,
    PLIVO_AUTH_TOKEN: plivoToken
  } = { ...config, ...secretsEnv, ...process.env }
  if (!plivoId) {
    throw new RangeError('missing plivoId')
  }
  if (!plivoToken) {
    throw new RangeError('missing plivoToken')
  }
  Object.assign(config, {
    plivoId, plivoToken, countryCode
  })
}

function makeResponse (code, body) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

async function handler (event, context) {
  // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
  const config = {}
  try {
    await hydrateConfig(config, event, context)
    const { count: numbersFound } = await searchNumbers(config)
    let smsRes
    if (numbersFound > 0) {
      smsRes = await sendSms(process.env.NOTIFICATION_PHONE_NUMBER, `${numbersFound} DID numbers found`)
        .catch(err => {
          return console.error(JSON.stringify({ error: err.toString() }))
        })
    }

    const message = JSON.stringify({
      numbersFound,
      smsSent: !!smsRes?.MessageId,
      smsMessageId: smsRes?.MessageId
    })
    this.putMetric("NumbersFound", numbersFound, Unit.Count)
    this.putMetric("SMSSent", message.smsSent ? 1 : 0, Unit.Count)
    console.info(message)
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: message }
  } catch (err) {
    const body = { error: err.toString() }
    console.error(JSON.stringify(body))
    if (err instanceof RangeError) {
      return makeResponse(400, body)
    }
    return makeResponse(500, body)
  }
}

module.exports = {
 handler: metricScope(metrics => handler.bind(metrics))
}

/*
[
  {
    "id": "18444701980",
    "city": null,
    "complianceRequirement": {
      "business": null,
      "individual": null
    },
    "country": "UNITED STATES",
    "lata": null,
    "mmsEnabled": false,
    "mmsRate": "0.00000",
    "monthlyRentalRate": "1.00000",
    "number": "18444701980",
    "prefix": "844",
    "prerequisites": [],
    "rateCenter": "",
    "region": "United States",
    "resourceUri": "/v1/Account/MAOWZJNGRMNTVKMZNKNW/PhoneNumber/18444701980/",
    "restriction": "",
    "restrictionText": "",
    "setupRate": "0.00000",
    "smsEnabled": false,
    "smsRate": "0.00580",
    "subType": "tollfree",
    "type": "tollfree",
    "voiceEnabled": true,
    "voiceRate": "0.02100"
  }
]
*/
