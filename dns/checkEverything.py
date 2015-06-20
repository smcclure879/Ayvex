#!/usr/bin/python

"""

 check everything about an internet connection for impact hub

  author:smcclure879


"""

import os,sys,httplib,time
#import functools
import subprocess



#early settings
echoLog = True
speaking = True



class Site:
    def __init__(self,nick,host,port,expectCode):
        self.nick = nick
        self.host = host
        self.port = port
        self.expectCode = expectCode
        self.strict = True
        self.timeout = 10


    def verify(self,interface):
        print self.nick
        try:
            conn = httplib.HTTPConnection(self.host, self.port, self.strict, self.timeout, interface.getAddressTuple())
        except HTTPException as ex:
            log("exception "+ex)
            return False
            
        res = ''
        try:
            conn.request("HEAD", "/")
            res = conn.getresponse()
        except:
            log("failed response:"+self.nick)
            return False


        try:
            conn.close()
        except:
            pass

        if res.status==self.expectCode:
            return True

        print res.status, res.reason
        return False



def portGiver():
    nextPort = int(8899)
    while True:
        yield nextPort
        nextPort += 1
openPorts = portGiver()

class NetInterface:
    def __init__(self,nick,name,ipAddr):
        self.nick = nick
        self.name = name
        self.ipAddr = ipAddr
    def getAddressTuple(self):
        return (self.ipAddr,openPorts.next())
    

def makeInterface(name,section):
    nick=getNick(name)
    ipAddr=seek(section,"inet addr")
    return NetInterface(nick,name,ipAddr)



def getNick(name):
    if name=="eth0":
        return "wired"
    elif name=="wlan0":
        return "wireless"
    else:
        return "unknown"





def run(prog,arg1):
    return runall([prog,arg1])

def runall(argsArray):
    return subprocess.check_output(argsArray)




FNULL = open(os.devnull, 'w')
def runhide(prog,arg1):
    cmd = subprocess.Popen([prog,arg1],stderr=FNULL) #bugbug how to hide input??
    stdoutdata, stderrdata = cmd.communicate()
    return stdoutdata

fh1=None
def log(x):
    x += "\n"
    fh1.write(x)
    if echoLog:
        print x


def closeAll():
    try:
        fh1.close()
    except:
        pass

    try:
        FNULL.close() #bugbug needed??
    except:
        pass


def quip(x):
    log(x)
    if speaking:
        runhide("espeak",x)  #it's noisy


def seek(corpus,soughtName):  #look for soughtName:  value  and return value
    chunks = corpus.split("  ")
    sought = soughtName + ":"
    theLen = len(sought)
    for chunk in chunks:
        if chunk[0:theLen]==sought:
            return chunk[len(sought):]
    return ''


MINUTES = 60


#settings are here

testSites = [
    Site("google","www.google.com",80,200),
    Site("comcast","www.comcast.com",80,301),  #they keep moving their site too!
    Site("ayvex","ayvex.dnsalias.com",8081,200),
    Site("bogus1","notAyvex.dnsalias.com",80,200),
    Site("bogus2","yapulousity.envalponer.com",80,200),
    Site("locaz1","192.168.1.1",80,200),
    Site("locaz2","10.1.1.1",80,200)
]


#chdir into own dir
os.chdir(os.path.dirname(sys.argv[0]))

# #figure the time for log file etc.
theTime = time.gmtime()
humanTime = time.strftime("%c")
timeForLogFile = time.strftime("%y%m%d%H",theTime)



# open the log
logFile = "./logs/netlog_"+timeForLogFile+".txt"
fh1=open(logFile,"ab+")


log("----starting log----time="+humanTime)


# #if less than 5 minutes since startup then hold off (exit)
uptime = int(float(run("cat","/proc/uptime").split(" ")[0]))
print uptime/3600,"hrs up"
if uptime<5*MINUTES:
    print "waiting 5 minutes "
    sleep(5*MINUTES)





# #if there's another of me then die
# run ps grep for checkEverything
procs = run("ps", "-A").split()
procsLikeMe =filter( lambda x: "checkEverything" in x,  procs )
if len(procsLikeMe)>1:
    quip("duplicate check running")
    exit(1)








sections = runall(["ifconfig"]).split("\n\n")
interfacesUp = 0

for section in sections:  #each is an interface
    lines=section.split("\n")
    name = lines[0].split("  ")[0]
    if not name:
        continue
    if name=='lo':
        continue
    print "interface="+name
    ipAddr=seek(section,"inet addr")
    if not ipAddr:
        quip("bad interface: "+getNick(name))
    else:
        interface = makeInterface(name,section)
        sitesOk = 0
        for site in testSites:
            if site.verify(interface):
                sitesOk += 1
            else:
                quip(site.nick + " is down")



        if sitesOk>0: #some are at least
            log("interface ok:" + interface.nick)
            interfacesUp += 1
        else:
            quip(interface.nick + "is down")
            #start pinging the router etc            

if interfacesUp<1:
    quip("comcast is down")

        
quip("c")
closeAll()

