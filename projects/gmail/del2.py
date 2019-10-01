import os,sys
import httplib2
import subprocess
import binascii
import base64
import datetime
import re
import dateparser
import hashlib
import time
from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage
from apiclient import errors


# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/drive-python-quickstart.json
#SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly'
#SCOPES = 'https://mail.google.com/'
SCOPES = ['https://mail.google.com/']
APPLICATION_NAME = 'gmail manager'
CLIENT_SECRET_FILE = 'client_secret_180806803438-0cjpkbekmnqdvk4fulannm72ues8qhp9.apps.googleusercontent.com.json'
dest="/media/removable/SD Card/sec-cam-arch/"

whoami=input("enter gmail: ").strip()
if len(whoami)<8:
    print("nope")
    sys.exit()
whoamiclean=str(binascii.crc32(bytes(whoami,"utf-8")))
    
if not os.path.isdir(dest):
    print("nope1208:"+dest)
    sys.exit()

try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()
except ImportError:
    flags = None



def die(x,y=""):
  print(x,y)
  sys.exit(1)




    
# def getFolderIdByName(name):
#     """
#     give a name as string, get an id as string
#     """
#     results = drive.files().list(
#         pageSize=25
#         ,q="name='"+name+"'"
# #better not be a         ,pageToken=nextPageToken
#         ,fields="nextPageToken, files(*)"
#     ).execute()

#     #can remove???
#     nextPageToken = results.get('nextPageToken')
    
#     items = results.get('files', [])
#     if not items:
#         raise Exception("cannot find 1"+name+"  "+str(results))
#     if len(items) != 1:
#         print(items)
#         raise Exception("cannot find 2..."+str(items))

#     item = items[0]
#     return item.get('id',None)


#     #md5=item.get('md5Checksum','--')
#     #parents = item.get('parents',['--'])[0]
#     #modifiedTime=item.get('modifiedTime','--')
#     #print('{0},{1},{2},{3}'.format(item['name'], item['id'], md5,parents))
#     #item['viewedByMeTime'], item.get('owners','x')))



#def hashfile(fname):
    # hash_md5 = hashlib.md5()
    # with open(fname, "rb") as f:
    #     for chunk in iter(lambda: f.read(4096), b""):
    #         hash_md5.update(chunk)
    #     return hash_md5.hexdigest()

# def fileAlreadyRemote(soughtHash):
#     results = drive.files().list(
#         pageSize=5
#         ,q="XXXXXXXXmd5checksum='"+soughtHash+"'"
#         ,fields="nextPageToken, files(*)"
#     ).execute()

#     items = results.get('files', [])
#     if not items:
#         return False
#     if len(items)==1:
#         return True;
#     return False


def run(something):
    return os.popen(something).read()

ct=0
def check(threads):
    global ct
    for x in threads:
        ct += 1
        if "0420160822AAWR098767096WCVU" in x['snippet'] :
            if ct%100 == 0 :
                print(ct,x['id'])
        else:
            print(x)


def prog(x):
    sys.stdout.write("\r")
    sys.stdout.write(x)
    sys.stdout.write("\t")
    sys.stdout.flush()


            

def dictify(arr):
    retval = dict()
    for x in arr:
        retval[x['name']] = x['value']

    return retval


def myHash(x):
    #return hash(x)
    return hashlib.md5(x).hexdigest()[-8:]



def retry( ff ):
    attempt=0
    while 1:
        attempt += 1
        try:
            return ff()
        except (Exception,PermissionError) as ex:
            print("forcing retry"+str(ex))
            #sys.exit()
            time.sleep(1.4**attempt * 2)

def parseDate(x):
    x=x.strip()
    print("about to parse date",x)
    if x is None or x=='':
        return None
    #retval = dateparser.parse(x)
    #if retval is not None   and   'day' in retval:
        return retval
    
    
    for formatString in [
            '%a, %d %b %Y %H:%M:%S %z',
            '%a, %d %b %Y %H:%M:%S %z (%Z)'    #""" Tue, 17 Jan 2017 23:12:20 +0000 (UTC) """
    ]:
        rv2=None
        try:
            print(formatString)
            rv2=datetime.datetime.strptime(x,formatString)
            if rv2 is not None:
                return rv2
        except:
            pass
    

    print("wierdDate="+x)
    print("bugbug713w--why is date none above")
    sys.exit()

    return retval
            
def singleWrite(path,fileData):
    with open(path, 'bw') as f:
        f.write(fileData)                


def get_credentials():
    """Gets valid user credentials from storage.

    If nothing has been stored, or if the stored credentials are invalid,
    the OAuth2 flow is completed to obtain the new credentials.

    Returns:
        Credentials, the obtained credential.
    """
    home_dir = os.path.expanduser('~')
    credential_dir = os.path.join(home_dir, '.credentials')
    if not os.path.exists(credential_dir):
        os.mkdir(credential_dir)
    credential_path = os.path.join(credential_dir, 'gmail.'+whoamiclean+'.mgr')

    store = Storage(credential_path)
    #print(dir(store))
    credentials = store.get()
    print("creds="+repr(credentials))
    if not credentials or credentials.invalid:
        flow = client.flow_from_clientsecrets(CLIENT_SECRET_FILE, SCOPES)
        flow.user_agent = APPLICATION_NAME
        if flags:
            credentials = tools.run_flow(flow, store, flags)
        else: # Needed only for compatibility with Python 2.6
            credentials = tools.run(flow, store)
        print('Storing credentials to ' + credential_path)
    return credentials


credentials = get_credentials()
http = credentials.authorize(httplib2.Http())
#drive = discovery.build('drive', 'v3', http=http)

service = retry(lambda: discovery.build('gmail', 'v1', http=http))
print("got serv")

#should just search for the start and endDates
#startDate = datetime.date(1999,1,1)
#endDate = datetime.date(2020,1,1)  #bugbug not futureproof
startDate = datetime.date(2017,5,1)
endDate = datetime.date(2017,12,30)  #bugbug not futureproof
oneDay = datetime.timedelta(days=1)

howManyDays=endDate-startDate
ids=dict()
for dd in range(howManyDays.days):
    dateSought=startDate + dd * oneDay
    date1=dateSought     #bugbug you are here did this work to  collapse window to 1 day?
    date2=dateSought+oneDay


    #         2018 2019 2020   search/find    alter date below    dateformate: yyyy/mm/dd
    ymd="%Y/%m/%d"  #  0420160822AAWR098767096WCVU    important flag is opposite what it would ideally be for these mails!!
    q="0420160822AAWR098767096WCVU is:important -is:archived -is:starred  after:%s  before:%s " %   (date1.strftime(ymd),date2.strftime(ymd)),
    print("  {}  {}".format(dateSought,q))

    result=retry(
        service.users().messages().list( q=q,  userId=whoami, maxResults=500  ).execute
        )


    ii=0
    dupCount=0
    #print(result.get('messages'));

    for x in result.get('messages',[]):
        ii+=1
        if ii>2000:
            print('how did we get here??')
            sys.exit()
        messageId=x['id']

        res2=retry(
            service.users().messages().delete(userId=whoami,id=messageId).execute
        )
        print(messageId,res2)

        print("done, waiting ")
        time.sleep(0.7)
        #sys.exit()
            
    #for dd in deletes:
            #    print(service.users().messages().trash(userId=whoami,id=dd).execute())
    



#while processOneBatch() > 0:
#    print("-------------------------------------------------------------------------------------------")

sys.exit()












"""




#query I want:
#from me
#to me
#not starred
#in inbox
#


query = "from:"+whoami
#labelIds=['UNREAD','IMPORTANT']
labelIds=['STARRED']
response = service.users().threads().list(
    userId=whoami,
    q=query,
    labelIds=labelIds,
    maxResults=200
).execute()
#print(response)

threads = []
if 'threads' in response:
    threads.extend(response['threads'])
    #print(str(threads))
else:
    print("what"+str(response))


check(threads)


while 'nextPageToken' in response:
    threads=[]
    page_token = response['nextPageToken']
    response = service.users().threads().list( labelIds=labelIds,    userId=whoami, q=query,
                                               pageToken=page_token).execute()
    threads.extend(response['threads'])
    check(threads)


sys.exit()
"""

# ids=results.get('id',[])
# if not ids:
#     print("no ids")
# else:
#     print("ids")
    

# results = service.users().labels().list(userId='me').execute()
# labels = results.get('labels', [])

# if not labels:
#     print('No labels found.')
# else:
#     print('Labels:')
#     for label in labels:
#         print(label['name'])





sys.exit()  





# def removeFront(fr,big):
#     """
#     remove fr from the front of string big
#     """
#     if not big.startswith(fr):
#         raise Exception("unexpect fr"+big)

#     return big[len(fr):]
    
    
# def readFile(f):
#     with open(f) as x:
#         return x.read()



    
# def doMediaDevice(devRoot,cid):
        
#     #insure another folder on SD card to backup to
#     #os.path.isdir(archiveFolder) or os.makedirs(archiveFolder) or die("cannot make archive folder")
#     #os.path.isdir(archiveFolder) or die("no archiveFolder:",archiveFolder)

#     for root, directories, filenames in os.walk(devRoot):
#         #for directory in directories:
#         #print os.path.join(root, directory)
#         for filename in filenames:
#             shortdir = removeFront(devRoot,root)
#             f= os.path.join(root,filename)
#             localHash = hashfile(f)
            
#             print("\t".join([localHash,cid,shortdir,filename]))


# def doMasterStick():
#     os.path.isdir(masterStickRoot) or die("is this the master memory stick for critters");

#     masterFsUuid = run("lsblk -n -o UUID /dev/sda").strip()
#     masterFsUuid=="3900-1CAB" or die("no master fs uuid:"+masterFsUuid)

#     doMediaDevice(masterStickRoot,masterFsUuid)
    


# def doSdCardInput():
#     #find SD card and DCIM/blah folder
#     os.path.isdir(sdCardRoot) or die("no sdCardRoot:",sdCardRoot)
#     os.path.isdir(camFolder) or die("no camFolder")
    
#     cid = readFile("/sys/block/mmcblk1/device/cid").strip()
#     cid or die("no cid")

#     doMediaDevice(sdCardRoot,cid)

    
    
# def doGoogleDrive():
#     #find google drive critters,etc folders
#     remoteRootId = 'root'
#     #critterFolderId = getFolderIdByName("critters")
#     #rabbitFolderId.... etc  (need a "set" of these to check membership against, later)
#     #remoteFoldersDict = ["critters","rabbit"].makeDict(getFolderIdByName);
                

#     nextPageToken=''        
#     #report on 
#     #go thru remote files: all of them
#     while 1:
#         results = drive.files().list(
#             pageSize=25
#             ,pageToken=nextPageToken
#             ,fields="nextPageToken, files(*)"
#         ).execute()

#         nextPageToken = results.get('nextPageToken')
    
#         items = results.get('files', [])
#         if not items:
#             break
    
#         #print('----Page---:\n\n')

#         for item in items:
#             if item.get('trashed',False):
#                 next
#             md5=item.get('md5Checksum','--')
#             if md5=='--':
#                 next

#             firstParent = item.get('parents',['--'])[0]
#             #modifiedTime=item.get('modifiedTime','--')
#             print('\t'.join([md5, firstParent, item['name'], item['id']]))

            
#         if not nextPageToken:
#             break


#     exit(0)


    

    #old code still below and needed to make above pseudocode work



     

#def print_about():
#    """Print information about the user along with the Drive API settings.
    
    # Args:
    # service: Drive API service instance.
    # """
    # #try:

    # about = drive.about().get(fields="*").execute()
    # print(about);
    # exit(0);
    # print('Current user name: %s' % about['name'])
    # print('Root folder ID: %s' % about['rootFolderId'])
    # print('Total quota (bytes): %s' % about['quotaBytesTotal'])
    # print('Used quota (bytes): %s' % about['quotaBytesUsed'])
    # #except errors.HttpError, error:
    # #    print('An error occurred: %s' % error)






