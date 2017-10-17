from __future__ import print_function
import os,sys
import httplib2
import subprocess

from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

from apiclient import errors

import hashlib


sdCardRoot = "/var/host/media/removable/SD Card/"
masterStickRoot = "/var/host/media/removable/USB DISK"
camFolder = sdCardRoot+"DCIM/100EK113/"
archiveFolder = sdCardRoot+"critterPic"


# If modifying these scopes, delete your previously saved credentials
# at ~/.credentials/drive-python-quickstart.json
SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly'
CLIENT_SECRET_FILE = 'critter.oauth.json'
APPLICATION_NAME = 'critter_oauth'




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



def hashfile(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
        return hash_md5.hexdigest()

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
    credential_path = os.path.join(credential_dir, 'critter.oauth.json')

    store = Storage(credential_path)
    #print(dir(store))
    credentials = store.get()
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
drive = discovery.build('drive', 'v3', http=http)
  

def removeFront(fr,big):
    """
    remove fr from the front of string big
    """
    if not big.startswith(fr):
        raise Exception("unexpect fr"+big)

    return big[len(fr):]
    
    
def readFile(f):
    with open(f) as x:
        return x.read()



    
def doMediaDevice(devRoot,cid):
        
    #insure another folder on SD card to backup to
    #os.path.isdir(archiveFolder) or os.makedirs(archiveFolder) or die("cannot make archive folder")
    #os.path.isdir(archiveFolder) or die("no archiveFolder:",archiveFolder)

    for root, directories, filenames in os.walk(devRoot):
        #for directory in directories:
        #print os.path.join(root, directory)
        for filename in filenames:
            shortdir = removeFront(devRoot,root)
            f= os.path.join(root,filename)
            localHash = hashfile(f)
            
            print("\t".join([localHash,cid,shortdir,filename]))

def run(something):
    return os.popen(something).read()

def doMasterStick():
    os.path.isdir(masterStickRoot) or die("is this the master memory stick for critters");

    masterFsUuid = run("lsblk -n -o UUID /dev/sda").strip()
    masterFsUuid=="3900-1CAB" or die("no master fs uuid:"+masterFsUuid)

    doMediaDevice(masterStickRoot,masterFsUuid)
    


def doSdCardInput():
    #find SD card and DCIM/blah folder
    os.path.isdir(sdCardRoot) or die("no sdCardRoot:",sdCardRoot)
    os.path.isdir(camFolder) or die("no camFolder")
    
    cid = readFile("/sys/block/mmcblk1/device/cid").strip()
    cid or die("no cid")

    doMediaDevice(sdCardRoot,cid)

    
    
def doGoogleDrive():
    #find google drive critters,etc folders
    remoteRootId = 'root'
    #critterFolderId = getFolderIdByName("critters")
    #rabbitFolderId.... etc  (need a "set" of these to check membership against, later)
    #remoteFoldersDict = ["critters","rabbit"].makeDict(getFolderIdByName);
                

    nextPageToken=''        
    #report on 
    #go thru remote files: all of them
    while 1:
        results = drive.files().list(
            pageSize=25
            ,pageToken=nextPageToken
            ,fields="nextPageToken, files(*)"
        ).execute()

        nextPageToken = results.get('nextPageToken')
    
        items = results.get('files', [])
        if not items:
            break
    
        #print('----Page---:\n\n')

        for item in items:
            if item.get('trashed',False):
                next
            md5=item.get('md5Checksum','--')
            if md5=='--':
                next

            firstParent = item.get('parents',['--'])[0]
            #modifiedTime=item.get('modifiedTime','--')
            print('\t'.join([md5, firstParent, item['name'], item['id']]))

            
        if not nextPageToken:
            break


    exit(0)


    

    #old code still below and needed to make above pseudocode work




def main():
    """should be a program to copy critter cam files from SD card to google drive, and organize them
    """
    #doSdCardInput()
    doMasterStick()
    #doGoogleDrive()

        
if __name__ == '__main__':
    main()



