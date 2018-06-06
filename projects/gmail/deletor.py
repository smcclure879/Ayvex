import os,sys
import httplib2
import subprocess
import binascii
import datetime
import re
import dateparser
from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage
from apiclient import errors



# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/drive-python-quickstart.json
#SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly'
#SCOPES = 'https://mail.google.com/'
SCOPES = ['https://www.googleapis.com/auth/gmail.modify']
APPLICATION_NAME = 'gmail manager'
CLIENT_SECRET_FILE = 'gmail_secret_appkey.json'



whoami=input("enter gmail: ").strip()
if len(whoami)<8:
    print("nope")
    sys.exit()
whoamiclean=str(binascii.crc32(bytes(whoami,"utf-8")))
    




try:
    import argparse
    flags = argparse.ArgumentParser(parents=[tools.argparser]).parse_args()



except ImportError:
    flags = None



def die(x,y=""):
  print(x,y)
  sys.exit(1)

def report(x):
    print(x)





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




    
def getFolderIdByName(name):
    """
    give a name as string, get an id as string
    """
    results = drive.files().list(
        pageSize=25
        ,q="name='"+name+"'"
#better not be a         ,pageToken=nextPageToken
        ,fields="nextPageToken, files(*)"
    ).execute()

    #can remove???
    nextPageToken = results.get('nextPageToken')
    
    items = results.get('files', [])
    if not items:
        raise Exception("cannot find 1"+name+"  "+str(results))
    if len(items) != 1:
        print(items)
        raise Exception("cannot find 2..."+str(items))

    item = items[0]
    return item.get('id',None)


    #md5=item.get('md5Checksum','--')
    #parents = item.get('parents',['--'])[0]
    #modifiedTime=item.get('modifiedTime','--')
    #print('{0},{1},{2},{3}'.format(item['name'], item['id'], md5,parents))
    #item['viewedByMeTime'], item.get('owners','x')))



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
        os.makedirs(credential_dir)
    credential_path = os.path.join(credential_dir, 'gmail.'+whoamiclean+'.mgr')

    store = Storage(credential_path)
    #print(dir(store))
    credentials = store.get()
    print(repr(credentials))
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

service = discovery.build('gmail', 'v1', http=http)
print("got serv")

#print (service.users().getProfile(userId=whoami).execute())
#print(service.users().labels().list(userId=whoami).execute())
#print("------------")
#print("")
result=service.users().messages().list(
    q="""  -is:starred  0420160822AAWR098767096WCVU   is:important   in:inbox  before:2017/08/16 """,
    userId=whoami,
    maxResults=500
).execute()


oldhour=-42
hour=0
deletes=[]
ii=0
for x in result['messages']:
    messageId=x['id']
    res2=service.users().messages().get(userId=whoami,format='full',id=messageId).execute()
    headers=dictify(res2['payload']['headers'])
    #print((messageId,headers['Date'],res2['snippet'],headers['Subject']))
    #bugbug you are here
    #want to keep only one message like this per hour
    date=dateparser.parse(headers['Date'])
    subj=headers['Subject']
    hour=date.hour
    mm=date.minute
    #print((hour,mm),messageId,subj)
    if oldhour==hour:
        ii+=1
        #print("should delete",messageId,subj )
        progMsg="DELETES %d %s %s %s %s %s" % (ii, str(date),subj,hour,mm,messageId)
        prog(progMsg)        #    bugbug you are here show date/time/sub/count of deletes
        deletes.append(messageId)
    else:
        print("RETAIN:",(hour,mm),messageId,date,subj )
        oldhour=hour
    
print(deletes)
print("number of deletes=",len(deletes))
for dd in deletes:
    print(service.users().messages().trash(userId=whoami,id=dd).execute())

    
sys.exit()

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




def main():
    """should be a program to copy critter cam files from SD card to google drive, and organize them
    """
    #doSdCardInput()
    #doMasterStick()
    #doGoogleDrive()

        
if __name__ == '__main__':
    main()



