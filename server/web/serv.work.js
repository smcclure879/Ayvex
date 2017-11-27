


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
    const details = ""+userPacket.clientTime+" srv58";

    event.waitUntil(
	// // Retrieve a list of the clients of this service worker.
	// self.clients.matchAll().then(function(clientList) {
	//     // Check if there's at least one focused client.
	//     var focused = clientList.some(function(client) {
	// 	return client.focused;
	//     });

	//     var notificationMessage;
	//     if (focused) {
	// 	notificationMessage = 'You\'re still here, thanks!';
	//     } else if (clientList.length > 0) {
	// 	notificationMessage = 'You haven\'t closed the page, ' +
	// 	    'click here to focus it!';
	//     } else {
	// 	notificationMessage = 'You have closed the page, ' +
	// 	    'click here to re-open it!';
	//    }

	
	self.registration.showNotification(
	    userPacket.msg,  //"title" ... really just most readable line!
	    {
		body: details,
		vibrate: [500, 100, 500],	    
		sound: '/web/beep.mp3',
		silent: false,

	    }  //more lines of text
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
		return clientList[0].focus();
	    }

	    // Otherwise, open a new page.
	    return self.clients.openWindow('try.html');
	})
    );
});
