DOCKER		   ?= docker
DOCKER_COMPOSE ?= docker-compose

.PHONY: 

all: build

# Builds a production docker container
build:
	make build
	$(DOCKER_COMPOSE) build

# Starts a production docker container (listens on port 8080)
start:
	$(DOCKER_COMPOSE) up web

build-dev:
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml build

# Starts a docker container for development
# This listens for http on port 8080, and listens for node debug on
# port 9229 (--inspect protocol)
# This also starts the Typescript compiler (tsc) and watches all typescript
# files for changes. When the files are changed, they will be compiled and
# then the server will restart.
start-dev:
	make watch-server &
	$(DOCKER_COMPOSE) -f docker-compose.dev.yml up web
