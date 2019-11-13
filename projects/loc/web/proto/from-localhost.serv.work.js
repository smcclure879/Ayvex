//actual service worker
//iterate this every time you check in or make major change!
const versionCode = "vvv00b";



// Immediately take control of the page, see the 'Immediate Claim' recipe
// for a detailed explanation of the implementation of the following two
// event listeners.

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
});



//bugbug you are here.  need to make the push
self.addEventListener('push', function(event) {

    //const userPacket = event.data.json();
    //const details = ""+userPacket.clientTime+" "+versionCode;

    event.waitUntil(  fetch("foo.foo")  //bugbug should be call to get loc
		      .then(function(res2) {
			  self.registration.showNotification(
			      "got res2...this is the title"+res2, 
			      {
				  body: 'more stuff here bugbug '+versionCode,
				  //vibrate: [400, 100, 400, 400, 400, 300, 200]	    
				  //sound: '/web/beep.mp3',  //nyi in clients
			      }  
			  )
		      })
		   );
    //bugbug use Promise.all instead to work in parallel??
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




