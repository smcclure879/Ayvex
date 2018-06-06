



function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "controls");
    this.sound.setAttribute("volume", 0.1);
    //this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
	this.sound.play();
    }
    this.stop = function(){
	this.sound.pause();
    }
}

function rept(ss,rat,delay) {
    window.setTimeout(function(){
	window.setInterval(function(){
	    ss.play();
	},rat);
    },Math.ceil(delay*rat)+1);
}

let bpm=120;
let rate = 60*1000/bpm;
let atick=new sound("tick.mp3");
let atick2=new sound("tick2.mp3");
let atickA=new sound("tick.mp3");


let oldStart=function(){
    rept(atick ,rate,0    );
    rept(atickA ,rate,8/16 );
    //rept(atick ,rate,8/16 );
    rept(atick2,rate,9/16  );
}

let newStart=function(){
    //play every 1th measure, 1/4th of way into measure
    playOn(1, 0, atick);
    playOn(1, 8/16, atick);
    playOn(1, 9/16, atick2);
}


function playOn(meas,frac,snd){
    //for now ignore meas, assume 1=every

    

}


window.onload=oldStart; //newStart
