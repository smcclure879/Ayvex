import collections

# s = [('yellow', 1), ('blue', 2), ('yellow', 3), ('blue', 4), ('red', 1)]
# d = collections.defaultdict(list)
# for k, v in s:
#     d[k].append(v)

# print(list(d.items()))



# exit(1)



tree = lambda: collections.defaultdict(tree)


# creatures = tree()
# creatures['birds']['eagle']['female'] = 0
# print(creatures)
# exit(1)

# import operator



h=tree()

spacing = 3
path = 'text.txt'
with open(path, 'r') as test_file:
    content = test_file.read()

vals = bytes(content,'utf-8')  #can we skip bytes and chr later?  
l=len(vals)

for ii in range(1,l):
    v=[47] * 2

    v[0]=vals[ ii ]
    v[1]=vals[ (ii+spacing) % l ]
    v.sort()

    cross = v[0] ^ v[1];

    #k = str(cross)+","+chr(v[0])+","+chr(v[1])
    
    if cross in h.keys() and v[0] in h[cross]:
        h[cross][v[0]] += 1
    else:
        h[cross][v[0]] = 0
    
    #print( k , h[k] )
    #str(vals[ ii % 51] ^ vals[ ii % 51 + 3 ])   )

    
for k,v in sorted(h.items(), key= lambda x : str(x[0]).split(",")[0], reverse=True):  #most popular first!!
    print(str(k)+"----"+str(v)+"----")

exit(1)





path = 'p059_cipher.txt'

with open(path, 'r') as content_file:
    content = content_file.read()

vals=list(map(int,content.split(',') ))

#everything xor with one 3 in front of it   xyza   would give x xor a
for ii in range(1,50):
    print(  vals[ ii % 51] ^ vals[ ii % 51 + 3 ]   )


