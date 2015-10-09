//  some async-but-sequential  file system examples including trying to use the promised-io/fs module





//  author:smcclure879


//var http = require('http');
var fsp = require('promised-io/fs');
var util = require('util');
//var subprocess = require('child_process');
var RSVP = require('rsvp');






var fh1 =   fsp.open("./logs/log2.txt",'a');

fh1.on('open',function(fhh) { fhh.write("here it is"); 
			    }).then(function() {
				fh1.close();
			    });




