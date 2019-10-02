//wake on lan sender

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const fs = require('fs');
const readline = require('readline');

async function processLineByLine(file,fn,then) {
    const fileStream = fs.createReadStream(file);
    let rl = readline.createInterface({
	input: fileStream,
	crlfDelay: Infinity    //recognize all instances of CR LF as single linebreak
    });

    rl.on('line', (line) => {
	console.log(`Line from file: ${line}`);
	fn(line);
    });

    rl.on('close', (what) => {
	console.log('what='+what);
	then();
    });
}

function bufferFromHex(str) {
    let retval=Buffer.from(str,"hex");
    console.log(retval);
    return retval;
}

const client = dgram.createSocket('udp4');
processLineByLine('listOfMacs.txt',function(line){

    let mac = line.trim().replace( '-', '' );
    let magicString = "ff".repeat(6)  +  mac.repeat(16);
    let magicPacket = bufferFromHex( magicString );
    client.send(magicPacket, 0, magicPacket.length, 9, '10.0.0.255', function(err, bytes) {
	if (err) {
	    console.log("err="+err);
	}else{
	    console.log('UDP message sent  '+mac);
	}
    });

}, function(){

    client.close();


});


    


