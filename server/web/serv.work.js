
//iterate this every time you check in or make major change!
const versionCode = "srv62";



// Immediately take control of the page, see the 'Immediate Claim' recipe
// for a detailed explanation of the implementation of the following two
// event listeners.

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});




self.addEventListener('push', function(event) {

    const userPacket = event.data.json();
    const details = ""+userPacket.clientTime+" "+versionCode;

    event.waitUntil(
	self.registration.showNotification(
	    userPacket.msg,  //"title" ... really just most readable line!
	    {
		body: details,  //more lines of text
		vibrate: [400, 100, 400, 400, 400, 300, 200]	    
		//sound: '/web/beep.mp3',  //nyi in clients
	    }  
	)
    );
});


// Register event listener for the 'notificationclick' event.
self.addEventListener('notificationclick', function(event) {
    event.waitUntil(
	// Retrieve a list of the clients of this service worker.
	self.clients.matchAll().then(function(clientList) {
	    // If there is at least one client, focus it.
	    if (clientList.length > 0) {
		var client = clientList[0];
		var retval = client.focus();
		client.postMessage({op:'reload'});
		return retval;
	    }

	    // Otherwise, open a new page.
	    var retval = self.clients.openWindow('try.html');
	    return retval;
	})
    );
});


function log(x) {
    console.log(x);
}



