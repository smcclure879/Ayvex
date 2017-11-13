var i = 0;

function timedCount() {
    i++;
    //postMessage(i);
    setTimeout("timedCount()",2000);
}

timedCount();
