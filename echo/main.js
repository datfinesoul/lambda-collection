'use strict'
function makeResponse (code, body) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }
}

async function handler (event, context) {
  const body = {hello: 'world!'}
  console.info(JSON.stringify(body))
  return makeResponse(200, body)
}

module.exports = {
 handler
}
