#!/bin/sh

if command -v nvm; then 
    nvm run $*
elif command -v node; then
    node $*
else
    >&2 echo "Could not find a node executable"
    exit 1
fi
