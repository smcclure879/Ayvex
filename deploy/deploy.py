#C:\Users\steve\Documents\GitHub\Ayvex\deploy> python .\deploy.py localhost:5984 user:pazzwordHEER index.html
#  (that is not the real user/password )

import pdb

import os,sys
import re
import json
import httplib
import urllib
import pprint
import time
from base64 import b64encode


usage= """
	USAGE:python server:port name:pwd <pattern>
		
		<pattern> ::  one of:  recent, all,  *.jpg
"""



cutoffTime=time.time()-4*60*60  #four hours in seconds

if len(sys.argv)<2:
	print usage
	raise BaseException("usage")


serverPort=b""+sys.argv[1]
userPass=b""+sys.argv[2]
if (len(sys.argv)>3):
	pattern=sys.argv[3]
	pattern = b""+sys.argv[3] if len(sys.argv)>3 else b""

designDoc="/cosmos/_design/passthru"
viewDoc="/cosmos/_design/views"
validationDoc="/cosmos/_design/validations"
sep="/"

def firstFoundVal(obj,listOfKeys,failOnErr):
	for k in listOfKeys:
		if (k in obj):
			return obj[k]
	print "no key found"
	pprint.pprint(obj)
	if failOnErr:
		raise "no key found"
	return ''
	
def extractRev(obj,failOnErr):
	return firstFoundVal(obj,['rev','_rev','etag'],failOnErr);			
	
def getFileBytes(file):
	with open(file, 'rb') as fh:
		return fh.read()

def getMimeType(file):
	if (file.endswith(".js")):
		return "application/javascript"
	if (file.endswith(".html")):
		return "text/html"
	if (file.endswith(".htm")):
		return "text/html"
	if (file.endswith(".gif")):
		return "image/gif"
	if (file.endswith(".jpg")):
		return "image/jpeg"
	return "application/octet-stream";

	
def getRevBestEffort(doc):
	return getRev(doc,False)


def getRev(doc=designDoc,failOnErr=True):
	conn = httplib.HTTPConnection(serverPort)
	conn.request("GET",doc)
	res = conn.getresponse()
	print res.status, res.reason
	data = res.read().decode('utf-8')
	print len(data)
	#print data
	obj=json.loads(data)
	return extractRev(obj,failOnErr)


def fileIsRecent(file):
	return os.stat(file).st_mtime > cutoffTime 
	
def allRelevantFilesUnder(startDir,pattern):
	howMuchToRemoveFromStartOfPaths=len(startDir)
	retval=[]
	for root, dirs, files in os.walk(startDir, topdown=True):
		for name in files:
			if name.endswith("~"):
				continue
			filePath=os.path.join(root, name)
			if pattern=="recent":
				if fileIsRecent(filePath):
					pass
				else:
					continue
			elif pattern=="all":
				pass
			else: #normal pattern
				if name.endswith(pattern):
					pass
				else:
					continue
			relativeUrl=filePath.replace("\\","/")[howMuchToRemoveFromStartOfPaths:]
			yield (filePath,relativeUrl,name)

			
def putAsData(filePath,dataId):   
	relativeUrl = "/cosmos/"+dataId
	rev=getRevBestEffort(relativeUrl)  #optimize this later
	revString = "?rev="+urllib.quote(rev) if rev else ''
	print "prevRevString="+revString
	editUrl=relativeUrl+revString
	print "editUrl="+editUrl
	body=getFileBytes(filePath)  #bugbug purify!!!
	mimeType=getMimeType(filePath)
	conn = httplib.HTTPConnection(serverPort)
	conn.request("PUT",editUrl,body,
			{
				'Content-type':mimeType,
				'Authorization' : authString
				
			}
		)
	res = conn.getresponse()
	print res.status, res.reason
	data = res.read().decode('utf-8')
	print len(data)
	#print data
	obj=json.loads(data)
	return extractRev(obj,True)

def putViewFile(filePath,dataId):
	
	if filePath.endswith("views.json"):
		doc=viewDoc
	elif filePath.endswith("validations.json"):
		doc=validationDoc
	else:
		raise Exception('reason','how we got here with no views.json filePath='+filePath)
	
	print filePath,"dataId="+dataId
			
	#this is the attachment code...useful here?
	rev=getRevBestEffort(doc)  #optimize this later
	if rev!="":
		rev="?rev="+urllib.quote(rev)
	print "rev string:"+rev
	editUrl=doc+rev
	print editUrl
	body=json.dumps(getPurifiedJson(filePath))
	mimeType=getMimeType(filePath)
	conn = httplib.HTTPConnection(serverPort)
	conn.request("PUT",editUrl,body,
			{
				'Content-type' : mimeType,
				'Authorization' : authString
				
			}
		)
	
	#pdb.set_trace()
	
	res = conn.getresponse()
	#print res.status, res.reason
	data = res.read().decode('utf-8')
	
	print len(data)
	#print data
	obj=json.loads(data)
	if 'error' in obj or res.status>299:
		raise('bugbug786s:'+res.reason+' - '+data+' - '+res.status)
	
	return extractRev(obj,True)  # true because we expect to get a 

	
	
def putAttachment(filePath,relativeUrl):
	rev=getRev()  #optimize this later
	print "prev rev="+rev
	editUrl=designDoc+'/'+relativeUrl+"?rev="+urllib.quote(rev)
	print editUrl
	
	body=getFileBytes(filePath)  #can't purify...probably not JSON!
	mimeType=getMimeType(filePath)
	conn = httplib.HTTPConnection(serverPort)
	#pdb.set_trace()
	conn.request("PUT",editUrl.encode('utf-8'),body,
			{
				'Content-type':mimeType,
				'Authorization':authString			
			}
		)
	res = conn.getresponse()
	#print res.status, res.reason
	data = res.read().decode('utf-8')

	print len(data)
	#print data
	obj=json.loads(data)
	return extractRev(obj,True)


def getPurifiedJson(someFile):  #bugbug shorten later
	data=getFileBytes(someFile)
	data=purify(data)
	obj=json.loads(data)
	return obj


def purify(s):
	lines=s.splitlines()
	lines=map(purifyLine,lines )
	return ''.join(lines)
	
	
#not strictly correct...won't deal with strings with special chars or // etc.but close enough for now
def purifyLine(s):
	s=re.sub(r'//.*','',s)  #remove comments
	s=re.sub(r'\s+',' ',s)  #remove excess space
	return s
	
	
	
#bugbug apply the __main__ pattern here...
userAndPass = b64encode(userPass).decode("ascii")
authString = u'Basic %s' %  userAndPass
items=allRelevantFilesUnder(".."+sep+"web",pattern)
for file,url,name in items:	
	
	while url.startswith("/"):
		url=url[1:]
	
	if url.endswith("views.json"):  #there better only be one file called this!
		result = putViewFile(file,name)
	elif url.endswith("validations.json"):
		result = putViewFile(file,name)  #bugbug note rename to design file???
	elif url.endswith(".json"):  #then also put it in as "data"
		result = putAsData(file,name)
	else: #regular file
		result = putAttachment(file,url)

	print "finished---"+result
	time.sleep(1)

