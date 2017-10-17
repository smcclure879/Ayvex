import os,sys


filename = sys.argv[1]


md5=None
line=None

with open(filename,"r") as f:
    for line in f:
        line = line.strip()
        fields = line.split("\t")
        oldmd5 = md5
        md5=fields[0]

        if md5==oldmd5:
            print line
            print prevLine

        prevLine=line
