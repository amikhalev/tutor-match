#!/usr/bin/env bash

pids=()

for command in "$@"; do
    $command &
    [ ! -z "$VERBOSE" ] || echo "Started \"$command\" with PID $!"
    pids+=("$!")
done

stop() {
    [ ! -z "$VERBOSE" ] || echo "Stopping PIDs $pids"
    for pid in "$pids"; do
        kill $pid
    done
    exit
}

trap stop SIGINT SIGTERM
while true; do sleep 1000; done
