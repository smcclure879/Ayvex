import os,sys
import json
import httplib
import urllib
import pprint
import time
from base64 import b64encode


if len(sys.argv)<1:
	raise "must provide name:pwd"


userPass=b""+sys.argv[1]
serverPort="192.168.1.110:5984"
designDoc="/cosmos/_design/passthru"
sep="/"

def firstFoundVal(obj,listOfKeys):
	for k in listOfKeys:
		if (k in obj):
			return obj[k]
	print "no key found"
	pprint.pprint(obj)
	raise "no key found"

def extractRev(obj):
	return firstFoundVal(obj,['rev','_rev','etag']);			
	
def getFile(file):
	content='bad'
	with open(file, 'r') as fh:
		return fh.read()

def getMimeType(file):
	if (file.endswith(".js")):
		return "text/javascript"
	if (file.endswith(".html")):
		return "text/html"
	if (file.endswith(".htm")):
		return "text/html"
	if (file.endswith(".gif")):
		return "image/gif"
	if (file.endswith(".jpg")):
		return "image/jpeg"
	return "application/octet-stream";

def getRev():
	conn = httplib.HTTPConnection(serverPort)
	conn.request("GET",designDoc)
	res = conn.getresponse()
	print res.status, res.reason
	data = res.read()
	print len(data)
	print data
	obj=json.loads(data)
	return extractRev(obj)
	
def allRelevantFilesUnder(startDir):
	howMuchToRemoveFromStartOfPaths=len(startDir)
	retval=[]
	for root, dirs, files in os.walk(startDir, topdown=True):
		for name in files:
			if (name.endswith("~")):
				continue
			filePath=os.path.join(root, name)
			relativeUrl=filePath.replace("\\","/")[howMuchToRemoveFromStartOfPaths:]
			yield (filePath,relativeUrl);
		# for name in dirs:
			# pass
			#print(os.path.join(root, name))
			
def putAttachment(filePath,relativeUrl):
	rev=getRev()  #optimize this later
	print "prev rev="+rev
	editUrl=designDoc+'/'+relativeUrl+"?rev="+urllib.quote(rev)
	print editUrl
	body=getFile(filePath)
	mimeType=getMimeType(filePath)
	userAndPass = b64encode(userPass).decode("ascii")
	conn = httplib.HTTPConnection(serverPort)
	conn.request("PUT",editUrl,body,
			{
				'Content-type':mimeType
				,				'Authorization' : 'Basic %s' %  userAndPass 
				
			}
		)
	res = conn.getresponse()
	#print res.status, res.reason
	data = res.read()
	print len(data)
	#print data
	obj=json.loads(data)
	return extractRev(obj)





items=allRelevantFilesUnder(".."+sep+"web")
for file,url in items:
	while url.startswith("/"):
		url=url[1:]
	print "finished"+putAttachment(file,url)
	time.sleep(1)

