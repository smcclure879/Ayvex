import sys,os,math
from itertools import permutations,count



def rwh_primes1(n):
    # https://stackoverflow.com/questions/2068372/fastest-way-to-list-all-primes-below-n-in-python/3035188#3035188
    """ Returns  a list of primes < n """
    sieve = [True] * (n//2)
    for i in range(3,int(n**0.5)+1,2):
        if sieve[i//2]:
            sieve[i*i//2::i] = [False] * ((n-i*i-1)//(2*i)+1)
            return [2] + [2*i+1 for i in range(1,n//2) if sieve[i]]



def sqrtc(x):
    x=float(x)
    y=math.sqrt(x)
    y=math.ceil(y)
    return y

maxNum=7654321; #must be like 543421 (descending digits)
cutPoint=sqrtc(maxNum)
allp=rwh_primes1(cutPoint+1)
print("got primes"+str(allp[-1]))
def isPrime(a):
    if a<=cutPoint:
        print("cut point fail")
        exit(2)
    for p in allp:
        if a%p == 0:
            return False
    return True

    
def oldPrime(a):
    q=int(sqrtc(a))
    for b in count(2,q):
        if (a%b==0):
            return False
    return True

def write(a):
    sys.stdout.write(str(a))



for a in map( lambda p: int(''.join(p)) , permutations(str(maxNum)) ):
    if not isPrime(a):
        continue

    print(a)

    

