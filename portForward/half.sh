#this should run in pi's crontab at startup (of machine if possible else of user)...don't run as root tho!
eval "$(ssh-agent)"
ssh-add /home/pi/gitstuff/ayvexMesh/portForward/keys/id_rsa 
ssh -fNT -R *:9094:localhost:22  pi@ayvex.dnsalias.com

