#!/usr/bin/python


#scan the subnet for a machine I have rights to that runs uname and brings back the right one.  
#not really finished.  saving for future elaboration/experiments


import subprocess
import sys

HOST="pi@73.35.144.2:2555"
# Ports are handled in ~/.ssh/config since we use OpenSSH
COMMAND="uname -a"

ssh = subprocess.Popen(["ssh", "%s" % HOST, COMMAND],
                       shell=False,
                       stdout=subprocess.PIPE,
                       stderr=subprocess.PIPE)
result = ssh.stdout.readlines()
if result == []:
    error = ssh.stderr.readlines()
    print >>sys.stderr, "ERROR: %s" % error
else:
    print result
	
