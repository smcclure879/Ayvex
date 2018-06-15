

# Can enable debug output by uncommenting:
#import logging
#logging.basicConfig(level=logging.DEBUG)

import Adafruit_BMP.BMP085 as BMP085
import serial,time

sensor = BMP085.BMP085()

# Optionally you can override the bus number:
#sensor = BMP085.BMP085(busnum=2)

# You can also optionally change the BMP085 mode to one of BMP085_ULTRALOWPOWER,
# BMP085_STANDARD, BMP085_HIGHRES, or BMP085_ULTRAHIGHRES.  See the BMP085
# datasheet for more details on the meanings of each mode (accuracy and power
# consumption are primarily the differences).  The default mode is STANDARD.
#sensor = BMP085.BMP085(mode=BMP085.BMP085_ULTRAHIGHRES)





port = serial.Serial("/dev/ttyUSB0", baudrate=4800, timeout=3.0)
encoding = 'ascii'
replaceOrIgnore='ignore'
seen=set()



raw=''
(timecode,maybeA,lat1,lat2,lon1,lon2,speed,track,datecode,blank1,blank2,checksum)=['init1']*12
(timecode,lat1,lat2,lon1,lon2,fixQuality,numSats,hdop,alt,altU,geoid,geoidU,wtf,checksum)=['init2']*14



while True:
  #print("     ",raw)
  timecode=0
  try:
    rcv = port.readlines(1)
  except Exception as ex:
    print("failure to readLines..will retry soon..."+repr(ex))
    time.sleep(15)
    continue
  
  if not rcv:
    continue

  try:
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
    

    tc=timecode
    hours,minutes,seconds = tc[:2],tc[2:4],tc[4:6]

    dc=datecode
    dd,mm,yyyy=dc[:2],dc[2:4],'20'+dc[4:6]

    datetime=yyyy+'-'+mm+'-'+dd+"Z"+hours+':'+minutes+':'+seconds


  
    fixQ = 'goodQ' if fixQuality=='1' else 'badQ'
  
    lat=lat2 + lat1[:2] + "deg" + lat1[2:] + "min" 
    lon=lon2 + lon1[:2] + "deg" + lon1[2:] + "min"

    #brk = "------"


    #print('Temp = {0:0.2f} *C'.format(sensor.read_temperature()))
    #print('Pressure = {0:0.2f} Pa'.format(sensor.read_pressure()))
    #print('Altitude = {0:0.2f} m'.format(sensor.read_altitude()))
    #print('Sealevel Pressure = {0:0.2f} Pa'.format(sensor.read_sealevel_pressure()))

    temp=str(sensor.read_temperature())+'degC'
    press=str(sensor.read_pressure())+'Pa'
    altBarom=str(sensor.read_altitude())+'m'

    #print(",".join([verb,datetime,temp,press,altBarom,'   ',lat,lon, brk, alt+'m',geoid, brk, numSats+"sats",fixQ]))

    print(",".join([datetime,verb,temp,press,altBarom,alt+'m',geoid,lat,lon,numSats+'sats',fixQ]))

  except Exception as ex:
    print(repr(ex))
    
  




