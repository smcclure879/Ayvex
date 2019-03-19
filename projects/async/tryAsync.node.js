const https = require('https');

//mar 2019 i need a way to call different web sites synchronously, which paradoxically means I need async functions

//designed to be called with await
async function grabx(url) {
    return new Promise( (resolve) => {
	https.get(url, (resp) => {
	    let data = '';
	    resp.on('data', (chunk) => {
		data += chunk;
		console.log("chunk:"+chunk);
	    });

	    resp.on('end', () => {
		console.log("resolving");
		resolve(data);
	    });

	}).on("error", (err) => {
	    console.log("Error: " + err.message);
	    throw err;
	});
    });
}


async function getActualIp() {
    return grabx("https://domains.google.com/checkip");
}


async function getDnsIp() {
    return "fake";
}

//periodically pm2 launches this, or simple/new nodejs script would  (the script that
var domain = {
    name:"dev.ayvexllc.com",
    user:"fake",
    pazz:"fake"
};




async function main() {
    var actualIp = await getActualIp();
    var dnsIp = await getDnsIp();
    if ( dnsIp != actualIp ) {
	console.log("actualIp="+actualIp+"done");
	//setIpForDomain( domain, actualIp );
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
