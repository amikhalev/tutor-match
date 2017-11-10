ifneq ($(wildcard ./.env),)
# $(info Loading environment variables from .env)
include ./.env
endif

YARN ?= $(shell command -v yarn || { \
		echo 'ERROR: yarn must be installed globally to $$PATH to build this app'; \
		exit 1; \
	})
ifneq (,$(findstring ERROR:,$(YARN)))
$(error $(YARN))
endif

NODE ?= $(shell nvm which $(cat .nvmrc) 2>/dev/null || \
	command -v node || \
	{ \
		echo 'ERROR: node or nvm must be installed an in $$PATH to build this app'; \
		exit 1; \
	})
ifneq (,$(findstring ERROR:,$(NODE)))
$(error $(NODE))
endif


NODE_MODULES_BIN :=./node_modules/.bin
TSC 	?=$(NODE) $(NODE_MODULES_BIN)/tsc
TSLINT  ?=$(NODE) $(NODE_MODULES_BIN)/tslint
NODEMON ?=$(NODE) $(NODE_MODULES_BIN)/nodemon

YARN_FLAGS 	  ?=
NODE_FLAGS    ?=
TSC_FLAGS	  ?=
TSLINT_FLAGS  ?=--format verbose
NODEMON_FLAGS ?=--delay 0.5 --quiet --exec make start

SERVER_SRCS :=$(wildcard server/*.ts) $(wildcard server/*/*.ts)
SERVER_OUTS :=$(subst server/,dist/,$(SERVER_SRCS:.ts=.js))

.PHONY: all clean clean-modules install-modules build build-server watch watch-server start start-watch

all: build lint

# Removes all files generated by the build (except node_modules)
clean:
	@echo "==> Removing build files"
	rm -rf dist static/js

clean-modules: clean
	@echo "==> Removing module files"
	rm -rf node_modules static/jspm

# Installs all dependencies
install-modules: package.json yarn.lock
	echo "==> Installing node-modules"
	$(YARN) $(YARN_FLAGS) install

# Target to install node_modules if depended upon by other targets
node_modules: package.json
	@[ -e node_modules ] || (echo "==> node_modules not found!" && make install-modules)

# Builds the entire app (excluding docker containers)
build: build-server
	@echo "==> Building tutor-match"

# Builds the server code (using typescript)
build-server: $(SERVER_OUTS)

$(SERVER_OUTS:.js=%js): node_modules server/tsconfig.json $(SERVER_SRCS)
	@echo "==> Building server"
	$(TSC) $(TSC_FLAGS) --project server

watch: watch-server

watch-server: node_modules
	@echo "==> Watching server for changes"
	$(TSC) $(TSC_FLAGS) --project server --watch

start:
# only build if not running on now.sh, and if in development
	@! [ "$$NOW" != "1" -a "$$NODE_ENV" == "development" ] || make build
	$(NODE) $(NODE_FLAGS) .

start-watch:
	echo "==> Restarting tutor-match on every rebuild"
	@scripts/parallel.sh 'make watch' '$(NODEMON) $(NODEMON_FLAGS)'

lint: $(SERVER_SRCS) node_modules
	$(TSLINT) $(TSLINT_FLAGS) --project server

lint-fix: $(SERVER_SRCS) node_modules
	TSLINT_FLAGS="$(TSLINT_FLAGS) --fix" make lint
