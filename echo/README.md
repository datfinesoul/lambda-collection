You can sorta do this with the aws-cli docker image. That comes with a lot of limitations though, e.g. you're limited to particular directories which actions volume-maps in: /github/home, /github/workspace, /github/workflow

```yaml
		steps:
			- name: Download File from S3
				uses: docker://amazon/aws-cli:2.0.7
				env:
					AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
					AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
				with:
					args: s3 cp s3://bucket/key /github/home/downloaded_file
```
