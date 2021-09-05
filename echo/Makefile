main:
	@echo "valid options:\n- build\n- lint"

build:
	mkdir __dist
	zip index main.js package.json

lint:
	npx standard --fix

.PHONY: main build lint
