


const { exec } = require('child_process');

const readline = require('readline');



function speak(x) {

    exec('espeak -a 200 -p 75 -v en-scottish  "'+x+'"');
	///uplift$ espeak -v en-scottish "ohcho wants treat" -a 200 -p 80
    
}


function done() {
    process.exit();
}

function doDefault(str,key) {
    console.log(`You pressed the "${str}" key`);
    console.log();
    console.log(key);
    console.log();
}

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
    doDefault(str,key);
    if (key.ctrl)
    {
	if ( key.name === 'c') {
	    done();
	}
    } else {
	switch(key.name+'') {
	case 'q': done();
	case 'undefined': switch (key.sequence) {
	    case '.': speak('NO!'); break;
	    case '+': speak('animal'); break;
	    case '-': speak('where'); break;
	    case '/': speak('smell'); break;
	    case '*': speak('go'); break;
	    default: doDefault(str,key); break;
	} break;
	case '0': speak('ohcho'); break;
	case '1': speak('want'); break;
	case '2': speak('abby'); break;
	case '3': speak('toy'); break;
	case '4': speak('isabel'); break;
	case '5': speak('food'); break;
	case '6': speak('good'); break;
	case '7': speak('home'); break;
	case '8': speak('sound'); break;
	case '9': speak('outside'); break;
	
	case 'backspace': speak('choo nay wah??'); break;
	//case '.': speak('NO!'); break;
	case 'return': speak('YES!'); break;

	default: doDefault(str,key); break;
	}
    }
});
console.log('Press any key...');
