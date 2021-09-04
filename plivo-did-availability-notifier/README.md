## Overview

```bash
aws lambda invoke \
  --function-name plivo-did-search \
  --payload "$(base64 <<< '{"countryCode": "JP"}')" \
  out.log
```

## TODO

- eventbridge cron
- access to sns
- access for eventbridge only to invoke?
  - https://docs.aws.amazon.com/lambda/latest/dg/access-control-resource-based.html
- environment vars from secrets
- source the lambda from github, or have github deploy it, but this script configure it?
