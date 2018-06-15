
import serial,time


port = serial.Serial("/dev/ttyUSB0", baudrate=4800, timeout=3.0)
encoding = 'ascii'
replaceOrIgnore='ignore'
seen=set()



raw=''
(timecode,maybeA,lat1,lat2,lon1,lon2,speed,track,datecode,blank1,blank2,checksum)=['0000']*12
(timecode,lat1,lat2,lon1,lon2,fixQuality,numSats,hdop,alt,altU,geoid,geoidU,wtf,checksum)=['init2']*14



while True:
  #print("     ",raw)
  timecode=0
  rcv = port.readlines(1)
  if not rcv:
    continue

  
  raw=rcv[0].decode(encoding,replaceOrIgnore).replace('\x00',"'NULL',")
  fields=raw.split(',')
  verb=fields[0]
  if verb[0] != '$':
    #print("--------------",verb)
    continue
  
  if verb=='$GPRMC' and len(fields)>11:
    (timecode,maybeA,lat1,lat2,lon1,lon2,speed,track,datecode,blank1,blank2,checksum)=fields[1:13]
    #'$GPRMC', '204639.000', 'A', '4741.5637', 'N', '12387.3994', 'W', '0.00', '267.45', '110618', '', '', 'A*7F\r\n'
  elif verb=='$GPGGA' and len(fields)>13:
    (timecode,lat1,lat2,lon1,lon2,fixQuality,numSats,hdop,alt,altU,geoid,geoidU,wtf,checksum)=fields[1:15]
    # $GPGGA,094412.000,4741.5545,N,12307.4505,W,1,10,1.0,88.5,M,-14.2,M,,0000*5D
  else:
    if verb not in seen:
      seen.add(verb)
      print("new verb!!!!!   ",raw)
    continue
    #print("--------------",verb,len(fields))

  tt=int(float(timecode))
  seconds=str(tt%100)
  minutes=str(tt//100%100)
  hours=str(tt//10000)

  datecode=int(datecode)
  yy=str(datecode%100)
  mm=str(datecode//100%100)
  dd=str(datecode//10000)

  yyyy='20'+yy

  datetime=yyyy+mm+dd+"Z"+hours+minutes+seconds

  fixQ = 'goodQ' if fixQuality=='1' else 'badQ'
  
  lat=lat2 + lat1[:2] + "deg" + lat1[2:] + "min" 
  lon=lon2 + lon1[:2] + "deg" + lon1[2:] + "min"

  brk = "------"

  print(",".join([verb,yy,mm,dd,"  ",hours,minutes,seconds,'   ',lat,lon, brk, alt,geoid, brk, numSats+"sats",fixQ]))




  




