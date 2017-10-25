NODE_MODULES_BIN := ./node_modules/.bin
NPM := npm
TSC := $(NODE_MODULES_BIN)/tsc
DOCKER_COMPOSE := docker-compose

SERVER_SRCS := $(wildcard server/*.ts) $(wildcard server/*/*.ts)
SERVER_OUTS := $(subst server/,dist/,$(SERVER_SRCS:.ts=))

.PHONY: all clean install install-prod build-server build-docker

all: build

clean:
	rm -rf dist

install: package.json
	$(NPM) install

node_modules: package.json
	[ ! -d node_modules ] && $(NPM) install

install-prod:
	$(NPM) install --production

build-server: $(addsuffix .js,$(SERVER_OUTS))

$(addsuffix %js, $(SERVER_OUTS)): node_modules server/tsconfig.json $(SERVER_SRCS)
	$(TSC) --project server

build-docker: build-server
	$(DOCKER_COMPOSE) build

start-docker: build-docker
	$(DOCKER_COMPOSE) up web

start-docker-debug: node_modules
	$(DOCKER_COMPOSE) build
	$(TSC) --project server --watch &
	$(DOCKER_COMPOSE) -f docker-compose.debug.yml up web

start-docker-debug-all: build-docker
	$(DOCKER_COMPOSE) -f docker-compose.debug.yml up
