const qw = function (s) {
    return s.split(" ");  //bugbug upgrade to regex to allow more spacing. 
};



const keysToWords={
    '.':qw("--not in use for words--"),
    'o':qw("ocho mommy daddy abby"),
    'h':qw("food hamburger kibble water treat"),
    '5':qw("one two five ten fifteen half minute hour"),
    'c':qw("play frisbee ball outside"),
    'z':qw("no yucky bad"),
    'q':qw("yes very please good")
    //bugbug get real word list
};
var activeKeys = Object.keys(keysToWords);

const { exec } = require('child_process');

const readline = require('readline');


function done() {
    process.exit();
}




function doDefault(str,key) {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
}


//notion of a pointer to what dog is currently nosing....
//make an object?
var currentKey='';
var currentCount=0;

function reset(k) {
    currentCount=0;
    currentKey=k;
}
function increment() {
    currentCount++;
    if (currentCount>=keysToWords[currentKey].length) currentCount=0;
}
function currentWord() {
    if (!currentKey) return;
    console.log(''+ currentKey + currentCount);
    console.log(''+ keysToWords[currentKey][0+currentCount]);
    return keysToWords[currentKey][0+currentCount]; 
}


const fs = require('fs')  //bugbug move
function fileExists(path) {
    try{
	if (fs.existsSync(path)) {
	    return true;
	}
    } catch(err) {
	console.error(err)
    }
    console.log(path);
    return false;
}

function quiet() {
    var x= currentWord();
    playWord(x,90,28,'quiet');
}

function louder() {
    var x= currentWord();
    playWord(x,180,90,'louder');
}

function playWord(word,vol1,vol2,label) {
    var filePath='nocheck-audio/'+word+'.wav';
    var cmd='uninit';
    if (fileExists(filePath)){
	cmd = 'mplayer -volume '+vol1+' "'+filePath+'"';
	console.log(label+"\n    "+cmd);
    }else{
	cmd='espeak -a '+vol2+' -p 75 -v en-scottish  "'+word+'"';
	console.log(label+"  bad way use computer speak....use aplay and wav files or simliar bugbug=\n   "+cmd);
    }
    
    exec(cmd);
}


// function louder() {
//     var x= currentWord();
//     //var cmd='aplay "nocheck-audio/'+x+'.wav"';
//     var cmd = 'mplayer -volume 180 "nocheck-audio/'+x+'.wav"';
//     console.log("louder    "+cmd);
//     exec(cmd);
// }




function cycle(k) {
    if (k=='.' && currentKey) {
	louder();
    	//reset('');
	return true;
    }

    if (k!=currentKey){
	reset(k);
    } else {
	increment();
    }

    quiet();
    return true;
}




function tryCycle(k) {
    console.log(Object.keys(keysToWords));
    console.log(k);
    if (activeKeys.includes(k))  return cycle(k);
    console.log("foo");
    return false;
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    //doDefault(str,key);
    if (key.ctrl)
    {
	if ( key.name === 'c') {
	    done();
	}
    } else {
	let k=''+( key.name || key.sequence);
	if (!tryCycle(k))
	    doDefault(str,key);
	
	
    }
});


console.log('Press any key...');
