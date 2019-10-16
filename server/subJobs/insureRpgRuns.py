import os,sys
import subprocess
import urllib.request


"""
1. ping rpg for data file?
2. if found quit
3. if not found fire and forget rpg process
"""


stuff='uninit'
try:
    with urllib.request.urlopen("http://rpg.ayvexllc.com") as response:
        stuff=str(response.read())
except:
    pass

print("stuff="+stuff)
if "Cannot GET" in stuff:
    print("good exit")
    sys.exit() #good exit

up=os.path.dirname;  #parent


here=up(os.path.abspath(__file__)) 
whereToRun=os.path.join( up(up(here)),   "projects",  "rpg")
whatToRun=["nodejs","newServer.node.js"]
#"../../projects/rpg" #bugbug move that dir???
res=subprocess.Popen( whatToRun, cwd=whereToRun )
print(res)
