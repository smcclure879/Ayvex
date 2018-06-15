import math,os,sys,io


def row(*args):
    sys.stdout.write("\t".join(map(str,args)))
    sys.stdout.write("\n")

c=0
prev=0
with open("riseFromLodge.txt") as f:
    for x in f:
        #x=f.readline()
        if len(x)<8 or x.startswith('new'):
            continue
        x=x.split(",")
        #print(x[4:9])
        try:
            alt1=float(x[4][:-1])
            alt2=float(x[5][:-1])+float(x[6])
            lat=x[7]
            lon=x[8]

            lat=float(lat[6:-3])
            lon=-float(lon[7:-3]) 

            impact=abs((alt2-prev)/alt2)
            prev=alt2
            thresh=0.01
            #print(abs(impact))
            
            if  c % 200 == 0  :
                row("1",c,lat,lon,alt2,alt1)
                pass
            elif  impact > thresh :
                row("2",c,lat,lon,alt2,alt1)
                
        except Exception as ex:
            #print(ex)
            continue

        limiting=False
        #limiting = True
        if limiting and c>10:
            exit()
        c+=1

        
