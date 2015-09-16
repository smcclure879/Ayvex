//  author:smcclure879

var http = require('http');
var fs = require('fs');
var util = require('util');
var subprocess = require('child_process');
//var request = require('request');


//can't use promiscuous (it's simpler to follow, but doesn't do hashSettled()
//var Promise = require('promiscuous');
var RSVP = require('rsvp');  //so trying this lib instead
var Promise = RSVP.Promise;









//bugbug all these should be detected/sussed by the prog not hardcoded
var routerIpAddr = '192.168.1.1'  
var externalPort = '9091';
var internalPort = '9091';
var internalIpAddr = '192.168.1.112';
var upDown = '1';










var multiline = function(f) {

    var EOL = "\n";
    var lines = f.toString().split(EOL);

    //throw out first and last
    lines.shift();
    lines.pop();

    return lines.join(EOL);

};


var url = util.format('http://%s:5000/Public_UPNP_C3', routerIpAddr);



var xmlTemplate = multiline(function(){  /*
<?xml version="1.0"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
<s:Body>
<u:AddPortMapping xmlns:u="urn:schemas-upnp-org:service:WANIPConnection:1">
<NewRemoteHost></NewRemoteHost>
<NewExternalPort>%s</NewExternalPort>
<NewProtocol>TCP</NewProtocol>
<NewInternalPort>%s</NewInternalPort>
<NewInternalClient>%s</NewInternalClient>
<NewEnabled>%s</NewEnabled>
<NewPortMappingDescription>ayvex:node:nat:upnp</NewPortMappingDescription>
<NewLeaseDuration>0</NewLeaseDuration>
</u:AddPortMapping>
</s:Body>
</s:Envelope>
				   */ });

var xmlData = util.format(xmlTemplate, externalPort, internalPort, internalIpAddr, upDown);




function postSoap(xmlData) {
  // Build the post string from an object
    var post_data = xmlData;


    // An object of options to indicate where to post to
    var post_options = {
	host: '192.168.1.1',
	port: '5000',
	path: '/Public_UPNP_C3',
	method: 'POST',
	headers: {

 	    'Content-Type': 'text/xml; charset="utf-8"',
	    'Connection': 'close',
	    'SOAPAction': '"urn:schemas-upnp-org:service:WANIPConnection:1#AddPortMapping"', 
            'Content-Length': post_data.length
	}
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
	});
    });

    // post the data
    post_req.write(post_data);
    post_req.end();

}



postSoap(xmlData);
//process.exit();

















//   querystring.stringify({
//	'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
//	'output_format': 'json',
//	'output_info': 'compiled_code',
//        'warning_level' : 'QUIET',
//        'js_code' : codestring
//    });



// headers: {
//     "Accept": "text/xml",
//     "Content-length": soapXML.length,
//     "Content-Type": "text/xml;charset=UTF-8",
//     "SOAPAction": "https://servicos.portaldasfinancas.gov.pt/sgdtws/documentosTransporte/",
// }






//bugbug could not install with npm on pi  request.post(url).form(xmlData).on('response', function(data,err) {








// var soapTemplate = multiline(function() {  /*
					   
// 					   # For forwarding traffic to my Raspberry PI through my Netgear Router  
// 					   curl 'http://${routerIp}:5000/Public_UPNP_C3' \
// 					   -X 'POST' \
// 					   -H 'Content-Type: text/xml; charset="utf-8"' \
// 					   -H 'Connection: close' \
// 					   -H 'SOAPAction: "urn:schemas-upnp-org:service:WANIPConnection:1#AddPortMapping"' \
// 					   -d '<?xml version="1.0"?>
// 					   <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
// 					   <s:Body>
// 					   <u:AddPortMapping xmlns:u="urn:schemas-upnp-org:service:WANIPConnection:1">
// 					   <NewRemoteHost></NewRemoteHost>
// 					   <NewExternalPort>${portExt}</NewExternalPort>
// 					   <NewProtocol>TCP</NewProtocol>
// 					   <NewInternalPort>${portInt}</NewInternalPort>
// 					   <NewInternalClient>${ipAddr}</NewInternalClient>
// 					   <NewEnabled>${upDown}</NewEnabled>
// 					   <NewPortMappingDescription>node:nat:upnp</NewPortMappingDescription>
// 					   <NewLeaseDuration>0</NewLeaseDuration>
// 					   </u:AddPortMapping>
// 					   </s:Body>
// 					   </s:Envelope>';
					   
// 					   */ });




