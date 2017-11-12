

h={}
#what to do in tie cases ?  return the first!
vals=[1,5,9,0,-8,-8,-9,-9]

for x in vals:
    if x in h:
        h[x] += 1
    else:
        h[x]=1

#maxVal= max(h.values())

        
print sorted(h.iteritems(), key=lambda (k,v): (v,k))[-1]


        
