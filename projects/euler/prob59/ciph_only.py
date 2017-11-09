



path = 'text.txt'
with open(path, 'r') as test_file:
    content = test_file.read()

vals = bytes(content,'utf-8')
for ii in range(1,150):
    v1=chr(vals[ii%151])
    v2=chr(vals[ii%151+3])
    print(  v1 + "  " + v2 + "  " +str(vals[ ii % 51] ^ vals[ ii % 51 + 3 ])   )

exit(1)





path = 'p059_cipher.txt'

with open(path, 'r') as content_file:
    content = content_file.read()

vals=list(map(int,content.split(',') ))

#everything xor with one 3 in front of it   xyza   would give x xor a
for ii in range(1,50):
    print(  vals[ ii % 51] ^ vals[ ii % 51 + 3 ]   )


