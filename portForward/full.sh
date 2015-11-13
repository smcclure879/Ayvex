netstat -ntl
#if output contains 127.0.0.1 and our port number on the same line, then we didn't do it right...need this



vim /etc/ssh/sshd_config
then add:

GatewayPorts clientspecified
save the file and restart sshd:

/etc/init.d/ssh restart
We could have just enable GatewayPorts by typing On instead of clientspecified, that would route any ssh tunnel to network interface. This way we can control which tunnel will be accessible f rom outside, and on which interface.
