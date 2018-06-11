
import serial
port = serial.Serial("/dev/ttyUSB0", baudrate=4800, timeout=3.0)
print(dir(port))
while True:
        #port.write("\r\nSay something:")
        print("waiting")
        rcv = port.read(10)
        print(repr(rcv))
        #port.write("\r\nYou sent:" + repr(rcv))
