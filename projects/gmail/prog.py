import sys
def p(x):
    sys.stdout.write("\r")
    sys.stdout.write(x)
    sys.stdout.write("\t")
    sys.stdout.flush()

for ii in range(1000000):
    p(str(ii))
        
