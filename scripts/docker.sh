#!/usr/bin/env bash

type=$1
shift

case $type in
prod|production)
    docker-compose $@
    ;;
dev|development)
    docker-compose -f docker-compose.dev.yml $@
    ;;
*)
    echo "Usage: $0 <dev|prod> [...ARGS]"
    exit 1
    ;;
esac
