import sys
from socket import *


cs = socket(AF_INET, SOCK_DGRAM)
cs.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
cs.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)


with open('listOfMacs.txt','r') as fh:
    for line in fh:
        #mac='78-45-c4-31-9e-9a'
        mac=bytes.fromhex(line.strip().replace('-',''))
        magicPacket = b'\xff'*6  +  mac*16
        cs.sendto(magicPacket, ('10.0.0.255', 9))
        print("done with line="+line);



