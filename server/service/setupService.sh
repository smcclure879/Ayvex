#!/bin/sh

rm /etc/init.d/ayvex
cp ayvex.service.sh /etc/init.d/ayvex

chmod a+x /etc/init.d/ayvex
chmod a+x /home/ayvex/gitstuff/ayvex/server/simple.server.node.js

rm /etc/rc2.d/S02ayvex
rm /etc/rc2.d/S03ayvex
rm /etc/rc2.d/S04ayvex
rm /etc/rc2.d/S05ayvex

ln -s /etc/init.d/ayvex /etc/rc2.d/S02ayvex
ln -s /etc/init.d/ayvex /etc/rc2.d/S03ayvex
ln -s /etc/init.d/ayvex /etc/rc2.d/S04ayvex
ln -s /etc/init.d/ayvex /etc/rc2.d/S05ayvex

update-rc.d ayvex enable

