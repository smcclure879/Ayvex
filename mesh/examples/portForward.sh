# For forwarding traffic to my Raspberry PI through my Netgear Router
curl 'http://192.168.1.1:5000/Public_UPNP_C3' \
  -X 'POST' \
  -H 'Content-Type: text/xml; charset="utf-8"' \
  -H 'Connection: close' \
  -H 'SOAPAction: "urn:schemas-upnp-org:service:WANIPConnection:1#AddPortMapping"' \
  -d '<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
<s:Body>
<u:AddPortMapping xmlns:u="urn:schemas-upnp-org:service:WANIPConnection:1">
  <NewRemoteHost></NewRemoteHost>
  <NewExternalPort>9091</NewExternalPort>
  <NewProtocol>TCP</NewProtocol>
  <NewInternalPort>9091</NewInternalPort>
  <NewInternalClient>192.168.1.112</NewInternalClient>
  <NewEnabled>1</NewEnabled>
  <NewPortMappingDescription>node:nat:upnp</NewPortMappingDescription>
  <NewLeaseDuration>0</NewLeaseDuration>
</u:AddPortMapping>
</s:Body>
</s:Envelope>'



