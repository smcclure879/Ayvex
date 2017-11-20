// var i = 0;

// function timedCount() {
//     i++;
//     //postMessage(i);
//     setTimeout("timedCount()",2000);
// }

//timedCount();



// self.addEventListener('push', function(event) {
//     event.waitUntil(
//         self.registration.showNotification('Ayvex Light Industries LLC', {
//             body: 'Alea iacta est',
//         })
//     );
// });


self.addEventListener('push', function(event) {
    //Retrieve the textual payload from event.data (a PushMessageData object).
    //Other formats are supported (ArrayBuffer, Blob, JSON),
    //check out the documentation on https://developer.mozilla.org/en-US/docs/Web/API/PushMessageData.

    //console.log("I am here inside teh servwork");

    //var payload = event.data ? event.data.text() : 'empty message: no payload';
    const userPacket = event.data.json();
    const details = ""+userPacket.clientTime+" srv52";
    
    //Keep the service worker alive until the notification is created.
    event.waitUntil(
	self.registration.showNotification(
	    userPacket.msg,
	    { body: details }
	)
    );
});
