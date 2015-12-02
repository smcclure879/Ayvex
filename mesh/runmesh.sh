#!/bin/bash

pushd $(dirname $0)
while true
do
    sleep 30
    nodejs mesh.js
done
popd

#bugbug while true repeat forever
