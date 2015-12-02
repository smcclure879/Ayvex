#!/bin/bash

pushd $(dirname $0)
while true
do
      nodejs mesh.js
done
popd

#bugbug while true repeat forever
