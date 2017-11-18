#!/bin/sh
# note should be copied into  /etc/init.d/ayvex

### BEGIN INIT INFO
# Provides: ayvex
# Required-Start: $remote_fs $syslog
# Required-Stop: $remote_fs $syslog
# Default-Start: 2 3 4 5
# Default-Stop: 0 1 6
# Short-Description: Simple script to start a program at boot bugbug
# Description: A simple script from www.stuffaboutcode.com which will start / stop a program a boot / shutdown.
### END INIT INFO


#if you want a command to always run, put it here



case "$1" in
start)
echo "starting ayvex"
nodejs  /home/ayvex/gitstuff/ayvex/server/simple.server.node.js
;;
stop)
echo "Stopping ayvex"
killall nodejs
#bugbug wrap up nodejs in an ayvex process
;;
*)
echo "Usage: /etc/init.d/ayvex {start|stop}"
exit 1
;;
esac
echo "ayvex out"
exit 0

