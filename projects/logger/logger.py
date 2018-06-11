
import serial


port = serial.Serial("/dev/ttyUSB0", baudrate=4800, timeout=3.0)
encoding = 'ascii'
replaceOrIgnore='ignore'

while True:
  #port.write("\r\nSay something:")
  print("waiting")
  rcv = port.readlines(1)
  if not rcv:
    continue

  raw=rcv[0].decode(encoding,replaceOrIgnore).replace('\x00',"'NULL',")
  
  #print("raw:"+raw)
  fields=raw.split(',')
  #print(fields[0],"         ",fields[1])
  #print(fields)
  #exit()
  #port.write("\r\nYou sent:" + repr(rcv))

  verb=fields[0]
  if verb[0] != '$':
    print(verb)
    continue

  if verb=='$GPRMC' and len(fields)>7:
    (timecode,maybeA,lat1,lat2,lon1,lon2)=fields[1:7]
    print(".....",timecode,"     ",lon1)
  else:
    print(verb,len(fields),"   ",raw)




KKKKKK
    
"""
['$GPRMC', '204639.000', 'A', '4749.5637', 'N', '12287.3994', 'W', '0.00', '267.45', '110618', '', '', 'A*7F\r\n']
waiting
  """







