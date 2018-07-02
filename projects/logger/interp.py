import math,os,sys,io
import fileinput

def row(*args):
    sys.stdout.write("\t".join(map(str,args)))
    sys.stdout.write("\n")

c=0
prev=0
with fileinput.input() as f:
    for x in f:
        #x=f.readline()
        if len(x)<8 or x.startswith('new'):
            continue
        x=x.split(",")
        #print(x[4:9])
        try:
            time1=x[0]
            if time1[:4] != "2018":
                continue
            year=int(time1[:4])
            mo=int(time1[5:7])
            day=int(time1[8:10])
            hr=int(time1[11:13])
            minx=int(time1[14:16])
            sec=int(time1[17:19])
            
            timecode= hr*3600 + minx*60 + sec


            alt1=float(x[4][:-1])
            alt2=float(x[5][:-1])+float(x[6])
            lat=x[7]
            lon=x[8]

            lat=float(lat[6:-3])
            lon=-float(lon[7:-3]) 

            impact=abs((alt2-prev)/alt2)
            prev=alt2
            thresh=0.03
            #print(abs(impact))
            
            if  c % 120 == 0  :
                row("byCount",timecode,lon,lat,alt2,alt1)
                pass
            elif  impact > thresh :
                row("byImpact",timecode,lon,lat,alt2,alt1)
                
        except Exception as ex:
            #print(ex)
            continue

        limiting=False
        #limiting = True
        if limiting and c>10:
            exit()
        c+=1

        
