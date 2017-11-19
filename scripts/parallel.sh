#!/usr/bin/env bash
# Runs 1 or more commands in parallel processes, as provided as arguments
#
# When SIGINT is re
# All command output will be prefixed with the command index (starting at 0).
# If VERBOSE is provided as an environment variable, then it will also log when it is
# starting and stopping processes

# ANSI color code for each command index
colors=(36 32 35 33 31 34)

pids=()
idx=0

for command in "$@"; do
    prefix=$(echo -e "\e[1m\e[${colors[$idx]}m[$idx]\e[0m ")
    ( $command | awk "\$0=\"$prefix\"\$0" ) &
    [ -z "$VERBOSE" ] || echo "${prefix}Started \"$command\" with PID $!"
    pids+=("$!")
    idx=$(($idx + 1))
done

stop() {
    [ -z "$VERBOSE" ] || echo "Stopping PIDs ${pids[*]}"
    for pid in "$pids"; do
        kill $@ $pid
    done
    exit
}

trap "stop -s INT" SIGINT
trap "stop -s TERM" SIGTERM
while true; do sleep 1000; done
