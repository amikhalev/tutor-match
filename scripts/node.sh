#!/usr/bin/env bash

[ -e $HOME/.nvm/nvm.sh ] && source $HOME/.nvm/nvm.sh

if which nvm 1>/dev/null; then 
    nvm run $*
elif which node 1>/dev/null; then
    node $*
else
    >&2 echo "Could not find a node executable"
    exit 1
fi
