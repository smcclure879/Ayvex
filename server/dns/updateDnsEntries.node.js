const https = require('https');
const fs = require('fs');
const dns = require('dns');
const pathlib = require('path');

//it is mar2019 and still having issues with dns

//but we have nodejs running automatically and real nice.  so rewrite in js.

//1. do google domains only at first.  dyndns later
//2. try to find free dns.  and/or reverse proxy


async function grabx(url,label) {
    if (!label) label = '';
    return new Promise( (resolve) => {
	https.get(url, (resp) => {
	    let data = '';
	    resp.on('data', (chunk) => {
		data += chunk;
		console.log("chunk:"+chunk+"     "+label);
	    });

	    resp.on('end', () => {
		console.log("resolving:"+label);
		resolve(data);
	    });

	}).on("error", (err) => {
	    console.log("Error: " + err.message);
	    throw err;
	});
    });
}


async function setIpForDomain(dom,ip){
    var url = "https://"+dom.user+":"+dom.pazz+"@domains.google.com/nic/update?hostname="+dom.name;
    // optional........+"&myip="+ip

    var result = await grabx( url ,"setIp for "+dom.name );
    if (result==911) {
	console.log("911 means error on google end. bugbug2053x.");
	//  suspect they require a newMANUAL login from same IP before they'll accept this.  so automation pretty useless ??
    }
    console.log("result="+result);  //a result of 911 is on their end....see https://support.google.com/domains/answer/6147083?hl=en
}
    



async function getActualIp() {
    return grabx("https://domains.google.com/checkip","checkip");
}


async function getDnsIp(dnsName) {
    return new Promise( (resolve) => {
	dns.lookup(dnsName, (err, address, family) => {
	    resolve(address);
	});
    });
}


const pazzFile = "realPazzFile.noCheckin.pazz";


async function readJsonFile(path) {
    return new Promise( (resolve) => {
	fs.readFile(path, 'utf8', function (err, data) {
	    if (err) throw err;
	    var obj = JSON.parse(data);
	    resolve(obj);
	});
    });
}

function canonicalize(path) {
    return pathlib.normalize(path);
}


async function main() {
    var actualIp = await getActualIp();
    var domainConfig = await readJsonFile(canonicalize(pazzFile));

    for (var domain of domainConfig) {
	console.log("----------"+domain.name+"---------");
	var dnsIp = await getDnsIp(domain.name);
	if (dnsIp != actualIp ) {
	    console.log("dns="+dnsIp);
	    console.log(actualIp);
	    setIpForDomain( domain, actualIp );
	} else {
	    console.log("***OK***");
	}
    }
}




/*
async function executeAsyncTask () {
    const valueA = await functionA()
    const valueB = await functionB(valueA)
    return function3(valueA, valueB)
}
*/

main();
