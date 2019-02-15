

document.onreadystatechange = function () {
    if (document.readyState == "interactive") {
	initApplication();
    }
}
document.onload = function () {
    initApplication();
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

var prepend = '<li>';

function fillInGame(gameName) {

    $.ajax({
	url:document.all.theForm.action,
	type:'get',
	//data:data,
	success:function(data) {
	    var lines = data.split(/\r?\n/);
	    var content =  prepend + lines.join(prepend); 
	    document.all.main.innerHTML=content;
	}
    });





    
}


function runThisWhenButtonPressed(evt) {
    evt.preventDefault();
    var url=document.all.theForm.action;  //$(this).closest('form').attr('action'),
    var data=$(this).closest('form').serialize();
    $.ajax({
	url:url,
	type:'post',
	data: data,
	success:function(){
	    alert(document.all.t.value);
	    
	    document.all.main.innerHTML+=  (prepend+document.all.t.value);
	}
    });

}
