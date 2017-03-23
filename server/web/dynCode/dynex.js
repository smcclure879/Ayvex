
var assert = {

    exist: function(x,label) { 
	if (!!x) return true;
	else throw new Error("not exist:"+label); 
    },
    notExist: function(x,label) {
	if (!x) return true;
	else throw new Error("exists!:"+label);
    }
    ,equal: function(a,b) { 
	if (a==b) return true;
	else throw new Error("not equal:"+a+"..."+b); 
    }
    ,notEqual: function(a,b) {
	if (a!=b) return true;
	else throw new Error("wrongly equal:"+a+"..."+b); 
    }
    ,fail: function() { throw new Error("foo"); }
    ,works: function() { return true; }
};

// test the testing...
// describe('never works', function() {
//     it('really never works', function() {
// 	assert.fail();
//     });
// });

$().ready(function() {


    describe('document', function() {
	it('should be present', function(done){
	    assert.exist(document);
	    done();
	});
    });
});


describe('dynamic code when not loaded', function() {
    it("cannot be used prematurely",function(done) {
	assert.equal('undefined',typeof bar);
	done();
    });
});





describe('Array', function() {
    describe('#indexOf()', function() {
	it('should return -1 when the value is not present', function(done) {
	    assert.equal(-1, [1,2,3].indexOf(4));
	    done();
	});
    });
});
    
    


describe('dynamic code2',function() {
    it('loads when asked',function(done) {    
	var url = "bar.dyn.js";
	jsl.load( url, function(tagId) {
    	    var x = bar.go();
    	    assert.equal(x,"this is bar");

	    var tag = document.querySelector("#"+tagId);
	    assert.exist(tag,"the tag");
    	    done();
	});
	    
    });
	
    it('can unload after a load',function(done) {
	var url = "bar.dyn.js";
    	jsl.load( url, function(theCode) {

    	    assert.exist(bar);
    	    var x = bar.go();
    	    assert.equal(x,"this is bar");

	    //can't get the delete down to dynamic can we???  bugbug
    	    jsl.unload( url );
	    delete bar;  

	    setTimeout(function() {
		assert.equal(typeof bar, "undefined");
		alert(bar.go());
    		done();
	    },1000);
    	});
    });
    



    it('this test not done yet');
    
    
    
}); 



