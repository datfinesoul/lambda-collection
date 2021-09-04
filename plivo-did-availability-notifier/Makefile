SHELL=/bin/bash
NAME=lambda-local:latest
main:
	echo "main"

trial:
	echo "${SHELL}"

build:
	docker build \
		--tag "$(NAME)" \
		.

run: build
	docker run \
		--publish 9000:8080 \
		--env-file .env \
		--rm \
		"$(NAME)"
		#--volume="$(shell pwd):/var/task:ro"

exec: build
	docker run \
		--publish 9000:8080 \
		--env-file .env \
		--rm \
		--detach \
		"$(NAME)"
	sleep 1
	curl -XPOST \
		"http://localhost:9000/2015-03-31/functions/function/invocations" \
		-d '{"countryCode":"JP"}'
	docker ps -a -q --filter ancestor="lambda-local:latest" --format="{{.ID}}" > .container.id
	cat .container.id | xargs docker logs
	cat .container.id | xargs docker stop
	rm .container.id

test:
	curl -XPOST \
		"http://localhost:9000/2015-03-31/functions/function/invocations" \
		-d '{"countryCode":"JP"}'

shell:
	docker run \
		--interactive \
		--tty \
		--rm \
		--env-file .env \
		--entrypoint '/bin/bash' \
		"$(NAME)"

lint:
	npx standard --fix

cleanup:
	docker system prune

.PHONY: main build run test shell lint trial exec cleanup
