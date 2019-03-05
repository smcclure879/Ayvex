//note: requires jquery

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
	initApplication();
    }
}
document.onload = function () {
    initApplication();
}


function htmlEncode(value){
    // Create a in-memory div, set its inner text (which jQuery automatically encodes)
    // Then grab the encoded contents back out. The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}


var justOnce = 0;
function initApplication() {
    if (justOnce) return;
    justOnce++;
    
    //get game name from the url or fake if 
    var gameName='foo';

    //own the page
    document.all.theForm.action="/game/"+gameName;
    document.title=gameName;
    document.all.submitButton.onclick=runThisWhenButtonPressed;
    

    fillInGame(gameName);
}



function tiny(x) {
    return "<span class='tiny'>"+x+"</span>";
}

function bold(x) {
    return "<b>"+x+"</b>";
}


function italic(x) {
    return "<i>"+x+"</i>";
}

function encolor(text,color) {
    return "<span style='color:"+color+"'>"+text+"</span>";
}

function processLine(s) {
    if (s=="") return "<br>";
    var parts = s.split("|");
    if (parts.length < 5) {
	return italic(s);
    }
    var	[timeCode,who1,who2,color,text] =  parts.map(unescape);
    if (color=="") color="black";

    timeCode=parseInt(timeCode)
    if(isNaN(timeCode) || timeCode<1e+9)
	timeCode="";
    else
	timeCode=new Date(timeCode).toUTCString();
    
    return tiny(timeCode)+" "+bold(who2)+" "+encolor(text,color);
}


var prepend = '<li>';
function fillInGame(gameName) {

    $.ajax({
	url:document.all.theForm.action,
	type:'get'
    }).done(function(data) {
	var lines = data.split(/\r?\n/);
	lines=lines.map(processLine);
	var content =  prepend + lines.join(prepend); 
	document.all.main.innerHTML=content;
    });
    
}


function runThisWhenButtonPressed(evt) {
    evt.preventDefault();
    var url=document.all.theForm.action;  //$(this).closest('form').attr('action'),
    var data=$(this).closest('form').serialize();
    $.ajax({
	url:url,
	type:'post',
	data: data
    }).done(function(){
	    document.all.main.innerHTML += prepend+htmlEncode(document.all.t.value);
    }).fail(function(a,b){
	alert(a);
	alert(b);
    });

}
