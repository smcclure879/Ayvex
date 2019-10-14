import os,sys
import httplib2
import binascii
import base64
import urllib.request
import email.mime.text
import time


from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage

import uuid
import hashlib

script_dir = os.path.dirname(__file__) #<-- absolute dir the script is in
relPath = "names.txt"
absFilePath = os.path.join(script_dir, relPath)
with open(absFilePath, "r") as fhr:
    nicks = fhr.readlines()
def myNick():
    x = "nickName"+str(uuid.getnode())
    x = x.encode('utf-8')
    y = int(hashlib.md5(x).hexdigest()[-4:], 16) % 2000
    return nicks[y//2].split('\t')[y%2+1].strip()
    
nick=myNick()

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

with urllib.request.urlopen("https://domains.google.com/checkip") as response:
    ip=str(response.read())
    


credentials = get_credentials()
http = credentials.authorize(httplib2.Http())

service = retry(lambda: discovery.build('gmail', 'v1', http=http))
print("got serv")

tofrom = 'tookatoucan@ayvexllc.com'

text='machineIP:'+nick+":"+ip
message = email.mime.text.MIMEText(text)
message['To'] = tofrom
message['From'] = tofrom
message['Subject'] = text
print(message)
message = { 'raw': base64.urlsafe_b64encode( message.as_bytes() ).decode() }
print(message)
message = service.users().messages().send(userId='me', body=message).execute()
print(message)


