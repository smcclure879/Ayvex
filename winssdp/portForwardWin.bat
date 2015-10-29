@echo off
REM work in progress did not quite work yet, saving sample for later.

curl "http://192.168.10.1:5000/Public_UPNP_C3" ^
   -X POST ^
   -H "Content-Type: text/xml; charset='utf-8'" ^
   -H "Connection: close" ^
   -H "SOAPAction: 'urn:schemas-upnp-org:service:WANIPConnection:1#AddPortMapping'" ^
   -d "<?xml version='1.0'?>   <s:Envelope xmlns:s='http://schemas.xmlsoap.org/soap/envelope/' s:encodingStyle='http://schemas.xmlsoap.org/soap/encoding/'>  <s:Body>  "


REM <u:AddPortMapping xmlns:u="urn:schemas-upnp-org:service:WANIPConnection:1">  ^
REM  <NewRemoteHost></NewRemoteHost>  ^
REM  <NewExternalPort>25563</NewExternalPort>  ^
REM  <NewProtocol>TCP</NewProtocol>  ^
REM  <NewInternalPort>22</NewInternalPort>  ^
REM  <NewInternalClient>192.168.10.215</NewInternalClient>  ^
REM  <NewEnabled>1</NewEnabled>  ^
REM  <NewPortMappingDescription>node:nat:upnp</NewPortMappingDescription>  ^
REM  <NewLeaseDuration>10</NewLeaseDuration>  ^
REM </u:AddPortMapping>  ^
REM </s:Body>  ^
REM </s:Envelope> ^
REM
REM ^

