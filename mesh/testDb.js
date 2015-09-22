var Datastore = require('nedb');
var util = require('util');






var print = console.log;
function dump(x) {
    try {
	if (typeof x === 'undefined')
	    return 'undefined';
	if (x == null) 
	    return 'null';
	var retval = util.inspect(x,false,null);
	return retval;
    } catch(ex) {
	return "bugbug1248c"+ex;
    }

}














var db = new Datastore({ filename: 'meshites.txt', autoload: true });  //synchronous load




var doc = { hello: 'world'
            , n: 5
            , today: new Date()
            , nedbIsAwesome: true
            , notthere: null
            , notToBeSaved: undefined  // Will not be saved
            , fruits: [ 'apple', 'orange', 'pear' ]
            , infos: { name: 'nedb' }
          };



db.insert(doc, function (err, newDoc) {   
    // this Callback is optional
    // newDoc is the newly inserted document, including its _id
    // newDoc has no key called notToBeSaved since its value was undefined


    console.log("err="+dump(err));
    console.log("newDoc="+dump(newDoc));

});

