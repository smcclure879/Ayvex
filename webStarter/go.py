import os
import json
import httplib
import urllib

"""{
  "_id":"attachment_doc",
  "_attachments":
  {
    "foo.txt":
    {
      "content_type":"text\/plain",
      "data": "VGhpcyBpcyBhIGJhc2U2NCBlbmNvZGVkIHRleHQ="
    }
  }
}"""

#print json.dumps({'foo':'bar'})
def firstFoundVal(obj,listOfKeys):
	for k in listOfKeys:
		if (k in obj):
			return obj[k]
	print "no key found"
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
	if (file.endswith(".gif")):
		return "image/gif"
	if (file.endswith(".jpg")):
		return "image/jpeg"
	return "application/octet-stream";


		
def getRev():
	conn = httplib.HTTPConnection("127.0.0.1:5984")
	conn.request("GET","/cosmos/_design/passthru")
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
	editUrl="/cosmos/_design/passthru/"+url+"?rev="+urllib.quote(rev)
	print editUrl
	body=getFile(filePath)
	mimeType=getMimeType(filePath)
	conn = httplib.HTTPConnection("127.0.0.1:5984")
	conn.request("PUT",editUrl,body,{'Content-type':mimeType})
	res = conn.getresponse()
	print res.status, res.reason
	data = res.read()
	print len(data)
	print data
	obj=json.loads(data)
	return extractRev(obj)

sep="/"
items=allRelevantFilesUnder(".."+sep+"web")
for file,url in items:
	print "finished"+putAttachment(file,url)

