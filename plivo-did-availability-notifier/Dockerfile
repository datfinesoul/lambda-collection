# https://github.com/aws/aws-lambda-base-images
# https://docs.aws.amazon.com/lambda/latest/dg/nodejs-image.html
# https://docs.aws.amazon.com/lambda/latest/dg/images-create.html#images-create-1
# https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
# https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-retrieve
# https://docs.aws.amazon.com/lambda/latest/dg/nodejs-context.html
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html

FROM public.ecr.aws/lambda/nodejs:14

ADD package*.json ${LAMBDA_TASK_ROOT}/
RUN npm clean-install --production
ADD main.js ${LAMBDA_TASK_ROOT}

CMD [ "main.handler" ]
